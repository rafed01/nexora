const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function test() {
  try {
    await sql`
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  requested_role TEXT;
  assigned_role TEXT;
  assigned_status TEXT;
  onboarding_flag BOOLEAN;
  user_full_name TEXT;
  user_org TEXT;
  org_id_val UUID;
BEGIN
  -- Extract requested role from auth metadata
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

  -- Gating logic: Enterprise and Advisor require vetting/pending approval
  IF assigned_role IN ('enterprise', 'advisor') THEN
    assigned_status := 'pending';
    onboarding_flag := FALSE;
  ELSE
    assigned_status := 'approved';
    onboarding_flag := FALSE;
  END IF;

  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
  user_org := new.raw_user_meta_data->>'organization';

  -- Match or link organization if organization slug/name is specified
  IF new.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      org_id_val := (new.raw_user_meta_data->>'organization_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      org_id_val := NULL;
    END;
  END IF;

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
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    user_full_name,
    user_org,
    org_id_val,
    assigned_role::public.user_role,
    assigned_status::public.approval_status,
    assigned_status,
    onboarding_flag,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    organization = COALESCE(EXCLUDED.organization, public.profiles.organization),
    -- Prevent overwriting an existing admin role through user metadata updates
    role = CASE 
       WHEN public.profiles.role::TEXT = 'admin' THEN 'admin'::public.user_role
      ELSE EXCLUDED.role
    END,
    organization_id = COALESCE(public.profiles.organization_id, EXCLUDED.organization_id),
    updated_at = NOW();

  RETURN new;
END;
$function$;
    `;
    console.log("Trigger function replaced successfully.");
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
