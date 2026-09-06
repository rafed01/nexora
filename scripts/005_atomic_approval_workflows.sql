-- ============================================================================
-- NEXORA MIGRATION 005: Atomic Account Approval Workflows (Idempotent)
-- ============================================================================
-- PostgreSQL functions execute within the caller's transaction. Each function
-- locks its target profile before checking it, so concurrent decisions cannot
-- create partial or contradictory approval states.
--
-- These RPCs are executable only by service_role. Browser requests never have
-- this key: server routes verify the actor with requirePlatformAdmin() or
-- requireEnterpriseOrgAuthority() before invoking a function.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.decide_top_level_account_approval(
  p_target_profile_id UUID,
  p_decision TEXT,
  p_reason TEXT,
  p_acting_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_profile public.profiles%ROWTYPE;
  acting_admin public.profiles%ROWTYPE;
  organization_record public.organizations%ROWTYPE;
  decision_time TIMESTAMPTZ := NOW();
  company_name TEXT;
BEGIN
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_decision', 'message', 'Invalid decision.');
  END IF;

  SELECT * INTO acting_admin
  FROM public.profiles
  WHERE id = p_acting_admin_id AND role::TEXT = 'admin';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden_actor', 'message', 'Platform administrator privileges are required.');
  END IF;

  SELECT * INTO target_profile
  FROM public.profiles
  WHERE id = p_target_profile_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_found', 'message', 'Account not found.');
  END IF;

  IF target_profile.role::TEXT NOT IN ('user', 'advisor', 'enterprise', 'company')
     OR target_profile.organization_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden_target', 'message', 'This account must be decided through its organization workflow.');
  END IF;
  IF target_profile.approval_status::TEXT <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'code', 'already_decided', 'message', 'This account has already been decided.');
  END IF;

  IF p_decision = 'approved' AND target_profile.role::TEXT IN ('enterprise', 'company') THEN
    company_name := NULLIF(BTRIM(target_profile.company_name), '');
    IF company_name IS NULL THEN
      RETURN jsonb_build_object('success', false, 'code', 'missing_company_name', 'message', 'Cannot approve enterprise account without a company name.');
    END IF;

    INSERT INTO public.organizations (
      name, owner_id, industry, domain, approval_status, verified_at, verified_by
    )
    VALUES (
      company_name,
      target_profile.id,
      target_profile.industry,
      NULLIF(SPLIT_PART(COALESCE(target_profile.email, ''), '@', 2), ''),
      'approved',
      decision_time,
      p_acting_admin_id
    )
    ON CONFLICT (owner_id) DO UPDATE SET
      name = EXCLUDED.name,
      industry = EXCLUDED.industry,
      domain = EXCLUDED.domain,
      approval_status = 'approved',
      verified_at = EXCLUDED.verified_at,
      verified_by = EXCLUDED.verified_by,
      updated_at = decision_time
    RETURNING * INTO organization_record;

    INSERT INTO public.organization_members (
      organization_id, user_id, role, is_primary
    )
    VALUES (organization_record.id, target_profile.id, 'owner', TRUE)
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = 'owner',
      is_primary = TRUE,
      updated_at = decision_time;
  END IF;

  UPDATE public.profiles
  SET
    approval_status = p_decision,
    status = p_decision,
    approved_by = p_acting_admin_id,
    approved_at = decision_time,
    rejection_reason = CASE
      WHEN p_decision = 'rejected' THEN COALESCE(NULLIF(BTRIM(p_reason), ''), 'Application declined by platform governance committee.')
      ELSE NULL
    END,
    organization_id = CASE
      WHEN p_decision = 'approved' AND target_profile.role::TEXT IN ('enterprise', 'company') THEN organization_record.id
      ELSE organization_id
    END,
    organization = CASE
      WHEN p_decision = 'approved' AND target_profile.role::TEXT IN ('enterprise', 'company') THEN company_name
      ELSE organization
    END,
    onboarding_completed = CASE
      WHEN p_decision = 'approved' AND target_profile.role::TEXT IN ('enterprise', 'company') THEN FALSE
      ELSE onboarding_completed
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'reviewed_by', p_acting_admin_id,
      'reviewed_by_email', acting_admin.email,
      'reviewed_at', decision_time,
      'decision_notes', NULLIF(BTRIM(p_reason), ''),
      'rejection_reason', CASE WHEN p_decision = 'rejected' THEN COALESCE(NULLIF(BTRIM(p_reason), ''), 'Application declined by platform governance committee.') ELSE NULL END
    ),
    updated_at = decision_time
  WHERE id = target_profile.id
  RETURNING * INTO target_profile;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'decided',
    'decision', p_decision,
    'profile', to_jsonb(target_profile),
    'organization', CASE WHEN organization_record.id IS NULL THEN NULL ELSE to_jsonb(organization_record) END,
    'decided_at', decision_time
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.decide_organization_employee_approval(
  p_target_profile_id UUID,
  p_decision TEXT,
  p_reason TEXT,
  p_manager_id UUID,
  p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_profile public.profiles%ROWTYPE;
  decision_time TIMESTAMPTZ := NOW();
BEGIN
  IF p_decision NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'code', 'invalid_decision', 'message', 'Invalid decision.');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles manager_profile
    WHERE manager_profile.id = p_manager_id
      AND (
        manager_profile.role::TEXT = 'admin'
        OR (
          manager_profile.role::TEXT IN ('enterprise', 'company')
          AND manager_profile.approval_status::TEXT = 'approved'
          AND manager_profile.organization_id = p_organization_id
          AND EXISTS (
            SELECT 1
            FROM public.organization_members manager_member
            WHERE manager_member.organization_id = p_organization_id
              AND manager_member.user_id = manager_profile.id
              AND manager_member.role IN ('owner', 'admin')
          )
        )
      )
  ) THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden_actor', 'message', 'Enterprise management authority is required.');
  END IF;

  SELECT * INTO target_profile
  FROM public.profiles
  WHERE id = p_target_profile_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'not_found', 'message', 'Employee not found.');
  END IF;
  IF target_profile.role::TEXT <> 'employee'
     OR target_profile.organization_id IS DISTINCT FROM p_organization_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'forbidden_target', 'message', 'Employee does not belong to this organization.');
  END IF;
  IF target_profile.approval_status::TEXT <> 'pending' THEN
    RETURN jsonb_build_object('success', false, 'code', 'already_decided', 'message', 'This employee has already been decided.');
  END IF;

  UPDATE public.profiles
  SET
    approval_status = p_decision,
    status = p_decision,
    approved_by = p_manager_id,
    approved_at = decision_time,
    rejection_reason = CASE
      WHEN p_decision = 'rejected' THEN COALESCE(NULLIF(BTRIM(p_reason), ''), 'Declined by organization management.')
      ELSE NULL
    END,
    updated_at = decision_time
  WHERE id = target_profile.id
  RETURNING * INTO target_profile;

  IF p_decision = 'approved' THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (p_organization_id, target_profile.id, 'employee')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = 'employee',
      updated_at = decision_time;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'decided',
    'decision', p_decision,
    'profile', to_jsonb(target_profile),
    'decided_at', decision_time
  );
END;
$$;

-- Restrict privileged RPC execution to server code authenticated with the
-- service-role key; public clients cannot invoke these functions directly.
REVOKE ALL ON FUNCTION public.decide_top_level_account_approval(UUID, TEXT, TEXT, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.decide_organization_employee_approval(UUID, TEXT, TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decide_top_level_account_approval(UUID, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.decide_organization_employee_approval(UUID, TEXT, TEXT, UUID, UUID) TO service_role;

COMMIT;
