-- ============================================================================
-- NEXORA MIGRATION 004: Enterprise Activation & Employee Approval (Idempotent)
-- ============================================================================
-- Description:
--   1. Adds enterprise/advisor signup company-info columns to public.profiles
--      that were being submitted at signup but never persisted (company_name,
--      company_size, industry, focus_area, advisory_history, linkedin_url).
--   2. Adds a partial unique index on organizations(owner_id) so that approving
--      the same enterprise account more than once (retry, double-click, race)
--      can never create a duplicate organization row — it becomes a safe
--      upsert target instead.
--   3. Recreates the signup trigger function to persist the company-info
--      fields above from auth.users.raw_user_meta_data, since Part 1 (admin
--      approval creating/linking an organization) depends on that data
--      actually existing on the enterprise profile.
--   4. FIXES A LIVE PRODUCTION BUG: guard_profile_updates() only ever bypasses
--      for public.is_admin(), which reads auth.uid(). Requests made with the
--      SUPABASE_SERVICE_ROLE_KEY (used by every server-side API route,
--      including the existing Admin approvals endpoint) carry NO user JWT, so
--      auth.uid() is NULL and is_admin() is always false for them — every
--      profiles UPDATE issued by a server route was being rejected with
--      "Unauthorized profile modification." (confirmed in the running dev
--      server logs). The fix adds an explicit, narrowly-scoped bypass for the
--      Postgres `service_role`, which is only reachable with the secret
--      service-role key and is never exposed to browsers; API-layer admin/
--      enterprise-authority checks (requirePlatformAdmin/requireEnterpriseOrgAuthority)
--      remain the actual authorization gate before any such query is issued.
--
-- Execution Instructions:
--   Run this directly in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/_/sql
--   Safe to re-run: every statement is additive/idempotent.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Additive company-info columns on profiles
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_name') THEN
    ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_size') THEN
    ALTER TABLE public.profiles ADD COLUMN company_size TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'industry') THEN
    ALTER TABLE public.profiles ADD COLUMN industry TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'focus_area') THEN
    ALTER TABLE public.profiles ADD COLUMN focus_area TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'advisory_history') THEN
    ALTER TABLE public.profiles ADD COLUMN advisory_history TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE public.profiles ADD COLUMN linkedin_url TEXT;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. One organization per owner: idempotent upsert target for enterprise activation
-- ----------------------------------------------------------------------------
-- NOTE: This must be a plain (non-partial) unique index. Supabase's
-- `.upsert(..., { onConflict: 'owner_id' })` generates `ON CONFLICT (owner_id)`
-- without restating a predicate, so Postgres can only use a plain unique
-- index/constraint as the arbiter — a partial index (`WHERE owner_id IS NOT
-- NULL`) is NOT matched by that inference and causes: "there is no unique or
-- exclusion constraint matching the ON CONFLICT specification". A plain
-- unique index is safe here since Postgres unique indexes already allow
-- multiple NULLs (accounts without an organization yet are unaffected).
DROP INDEX IF EXISTS public.uq_organizations_owner_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_organizations_owner_id
  ON public.organizations(owner_id);

-- ----------------------------------------------------------------------------
-- 3. Persist enterprise/advisor signup metadata that was previously discarded
-- ----------------------------------------------------------------------------
-- Recreates handle_new_user_safe_v3 with the exact same trigger wiring as
-- scripts/003_auth_trigger_repair.sql, only adding capture of the additional
-- company-info fields above. Nothing about role assignment, approval status,
-- or the AFTER INSERT ONLY trigger contract changes.
CREATE OR REPLACE FUNCTION public.handle_new_user_safe_v3()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  requested_role TEXT;
  assigned_role public.user_role;
  assigned_status public.approval_status;
  target_org_id UUID;
  org_is_approved BOOLEAN;
  clean_full_name TEXT;
  clean_org_name TEXT;
  clean_company_name TEXT;
  clean_company_size TEXT;
  clean_industry TEXT;
  clean_focus_area TEXT;
  clean_advisory_history TEXT;
  clean_linkedin_url TEXT;
BEGIN
  -- Map metadata role strictly: public signup can NEVER request admin.
  -- Permitted values: 'user', 'employee', 'advisor', 'enterprise'. Convert 'admin' or others to 'user'.
  requested_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'user'));

  IF requested_role IN ('enterprise', 'company', 'corporate') THEN
    assigned_role := 'enterprise'::public.user_role;
  ELSIF requested_role IN ('employee') THEN
    assigned_role := 'employee'::public.user_role;
  ELSIF requested_role IN ('advisor', 'expert') THEN
    assigned_role := 'advisor'::public.user_role;
  ELSE
    -- Default or 'admin' or anything else maps securely to 'user'
    assigned_role := 'user'::public.user_role;
  END IF;

  -- Every newly created public account must have pending approval and incomplete onboarding
  assigned_status := 'pending'::public.approval_status;

  -- Handle organization ID extraction safely (non-UUID or missing -> NULL)
  target_org_id := NULL;
  IF new.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      target_org_id := (new.raw_user_meta_data->>'organization_id')::UUID;

      -- Link an employee ONLY when the selected organization exists and is approved
      SELECT (approval_status::TEXT = 'approved') INTO org_is_approved
      FROM public.organizations
      WHERE id = target_org_id;

      IF org_is_approved IS NOT TRUE THEN
        target_org_id := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      target_org_id := NULL;
    END;
  END IF;

  -- Sanitize text inputs
  clean_full_name := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')) FROM 1 FOR 255);
  clean_org_name  := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'organization', '')) FROM 1 FOR 255);
  clean_company_name := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'company_name', '')) FROM 1 FOR 255);
  clean_company_size := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'company_size', '')) FROM 1 FOR 100);
  clean_industry := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'industry', '')) FROM 1 FOR 255);
  clean_focus_area := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'focus_area', '')) FROM 1 FOR 255);
  clean_advisory_history := TRIM(COALESCE(new.raw_user_meta_data->>'advisory_history', ''));
  clean_linkedin_url := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'linkedin_url', '')) FROM 1 FOR 512);

  -- Create profile once using ON CONFLICT (id) DO NOTHING. Do not update on re-triggers.
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    organization,
    organization_id,
    role,
    approval_status,
    status,
    onboarding_completed,
    company_name,
    company_size,
    industry,
    focus_area,
    advisory_history,
    linkedin_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    NULLIF(clean_full_name, ''),
    NULLIF(clean_org_name, ''),
    target_org_id,
    assigned_role,
    assigned_status,
    'pending',
    FALSE,
    NULLIF(clean_company_name, ''),
    NULLIF(clean_company_size, ''),
    NULLIF(clean_industry, ''),
    NULLIF(clean_focus_area, ''),
    NULLIF(clean_advisory_history, ''),
    NULLIF(clean_linkedin_url, ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- If employee registered under a valid approved organization, add pending organization_member record
  IF assigned_role::TEXT = 'employee' AND target_org_id IS NOT NULL THEN
    INSERT INTO public.organization_members (
      organization_id,
      user_id,
      role,
      title,
      is_primary
    )
    VALUES (
      target_org_id,
      new.id,
      'employee',
      SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'title', 'Staff')) FROM 1 FOR 100),
      TRUE
    )
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate exactly one trigger running AFTER INSERT ONLY (Never after UPDATE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_safe_v3();

-- ----------------------------------------------------------------------------
-- 4. Fix guard_profile_updates(): allow the trusted service_role to perform
--    server-authorized updates (Admin approvals, enterprise employee
--    decisions). All other branches are unchanged from
--    scripts/002_production_security.sql.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Requests authenticated with the service-role key carry no user JWT, so
  -- auth.uid() is NULL and is_admin()/is_org_manager() can never match them.
  -- The service-role key is never exposed to the browser; every server route
  -- that uses it (e.g. /api/admin/approvals, /api/organizations/manage) has
  -- already independently verified platform-admin or enterprise-org
  -- authority before issuing the write. Bypass the guard for that role only.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- If current user is a platform admin, allow all profile updates
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- If an approved enterprise owner/admin is updating an employee in their org
  IF public.is_org_manager(OLD.organization_id) AND OLD.role::TEXT = 'employee' THEN
    -- Enterprise managers can only approve/reject their employees or update departmental fields
    -- They cannot make employees into platform admins
    IF NEW.role::TEXT = 'admin' THEN
      RAISE EXCEPTION 'Enterprise managers cannot assign admin roles.';
    END IF;
    NEW.approved_by = auth.uid();
    NEW.approved_at = NOW();
    RETURN NEW;
  END IF;

  -- Regular users updating their own profile: privileged fields must NOT change
  IF auth.uid() = OLD.id THEN
    IF (NEW.role::TEXT IS DISTINCT FROM OLD.role::TEXT) THEN
      RAISE EXCEPTION 'Security violation: You cannot alter your role.';
    END IF;
    IF (NEW.approval_status::TEXT IS DISTINCT FROM OLD.approval_status::TEXT) THEN
      RAISE EXCEPTION 'Security violation: You cannot alter your approval status.';
    END IF;
    IF (NEW.status::TEXT IS DISTINCT FROM OLD.status::TEXT) THEN
      RAISE EXCEPTION 'Security violation: You cannot alter your account status.';
    END IF;
    IF (NEW.approved_by IS DISTINCT FROM OLD.approved_by) THEN
      RAISE EXCEPTION 'Security violation: You cannot alter your approver.';
    END IF;
    IF (NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
      RAISE EXCEPTION 'Security violation: You cannot alter your approval timestamp.';
    END IF;
    IF (NEW.organization_id IS DISTINCT FROM OLD.organization_id) THEN
      RAISE EXCEPTION 'Security violation: You cannot transfer your organization linkage.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized profile modification.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger wiring is unchanged; CREATE OR REPLACE FUNCTION above is sufficient
-- since the trigger already points at public.guard_profile_updates().

COMMIT;

-- ============================================================================
-- DIAGNOSTIC QUERIES (Run these to verify the migration state)
-- ============================================================================

-- A. Confirm the new profile columns exist:
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
--   AND column_name IN ('company_name','company_size','industry','focus_area','advisory_history','linkedin_url');

-- B. Confirm the partial unique index exists:
-- SELECT indexname FROM pg_indexes WHERE tablename = 'organizations' AND indexname = 'uq_organizations_owner_id';

-- C. Confirm exactly one AFTER INSERT trigger remains on auth.users:
-- SELECT trigger_name, event_manipulation, action_statement
-- FROM information_schema.triggers
-- WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- D. Confirm the guard_profile_updates() service_role bypass is present:
-- SELECT prosrc FROM pg_proc WHERE proname = 'guard_profile_updates';
-- (should contain "auth.role() = 'service_role'")
