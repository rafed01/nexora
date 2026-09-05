const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function test() {
  try {
    await sql`
CREATE OR REPLACE FUNCTION public.handle_new_user_security()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  requested_role TEXT;
  assigned_role TEXT;
  assigned_status TEXT;
  target_org_id UUID;
  org_is_approved BOOLEAN;
  clean_full_name TEXT;
  clean_org_name TEXT;
BEGIN
  -- Extract requested role from raw metadata, defaulting to 'user'
  requested_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'user'));

  -- SECURITY CONSTRAINT: Public signup can NEVER create an admin account.
  -- Map to canonical app roles: 'admin', 'enterprise', 'employee', 'user', 'advisor'
  IF requested_role = 'admin' THEN
    assigned_role := 'user';
  ELSIF requested_role IN ('enterprise', 'company', 'corporate') THEN
    assigned_role := 'enterprise';
  ELSIF requested_role IN ('employee') THEN
    assigned_role := 'employee';
  ELSIF requested_role IN ('advisor', 'expert') THEN
    assigned_role := 'advisor';
  ELSE
    assigned_role := 'user';
  END IF;

  -- Verify target organization if employee requested linkage
  target_org_id := NULL;
  IF new.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      target_org_id := (new.raw_user_meta_data->>'organization_id')::UUID;
      -- Verify that target organization exists and is approved
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

  -- ALL SIGNUPS START IN 'pending' STATE FOR GOVERNANCE
  -- Independent users, advisors, enterprises, and employees start pending
  assigned_status := 'pending';

  -- Sanitize metadata inputs
  clean_full_name := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')) FROM 1 FOR 255);
  clean_org_name  := SUBSTRING(TRIM(COALESCE(new.raw_user_meta_data->>'organization', '')) FROM 1 FOR 255);

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
    approved_by,
    approved_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    NULLIF(clean_full_name, ''),
    NULLIF(clean_org_name, ''),
    target_org_id,
    assigned_role::public.user_role,
    assigned_status::public.approval_status,
    assigned_status,
    FALSE,
    NULL,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    organization = COALESCE(public.profiles.organization, EXCLUDED.organization),
    -- Never permit overriding admin role or approved status from signup re-trigger
    role = CASE
      WHEN public.profiles.role::TEXT = 'admin' THEN 'admin'::public.user_role
      ELSE public.profiles.role
    END,
    approval_status = public.profiles.approval_status,
    updated_at = NOW();

  -- If employee registered under a valid approved organization, add pending organization_member record
  IF assigned_role = 'employee' AND target_org_id IS NOT NULL THEN
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

  RETURN new;
END;
$function$;
    `;
    console.log("Trigger function updated.");
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
