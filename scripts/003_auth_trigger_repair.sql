-- ============================================================================
-- NEXORA REPAIR MIGRATION 003: Robust Idempotent Auth Trigger Repair
-- ============================================================================
-- NOTE: This migration MUST run AFTER INSERT only. 
-- It must NEVER run after UPDATE, because login updates auth.users (e.g. last_sign_in_at) 
-- and running profile updates on login can trigger race conditions, recursion, 
-- or overwrite existing user states ("Database error granting user" / "Database error saving new user").
-- ============================================================================

BEGIN;

-- 1. Safely drop all existing profile-creation triggers on auth.users to eliminate conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Drop old functions if desired, or keep them to prevent broken dependencies (we will recreate our clean function)
-- We use a clean, dedicated function name: handle_new_user_safe_v3
DROP FUNCTION IF EXISTS public.handle_new_user_safe_v3() CASCADE;

-- 2. Create the secure, idempotent trigger function with explicit safe search_path
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
BEGIN
  -- 8 & 9. Map metadata role strictly: public signup can NEVER request admin.
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

  -- 10. Every newly created public account must have pending approval and incomplete onboarding
  assigned_status := 'pending'::public.approval_status;

  -- 13. Handle organization ID extraction safely (non-UUID or missing -> NULL)
  target_org_id := NULL;
  IF new.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      target_org_id := (new.raw_user_meta_data->>'organization_id')::UUID;
      
      -- 14. Link an employee ONLY when the selected organization exists and is approved
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

  -- 6 & 7. Create profile once using ON CONFLICT (id) DO NOTHING. Do not update on re-triggers.
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
    NULLIF(clean_full_name, ''),
    NULLIF(clean_org_name, ''),
    target_org_id,
    assigned_role,
    assigned_status,
    'pending',
    FALSE,
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

-- 3 & 4. Recreate exactly one trigger running AFTER INSERT ONLY (Never after UPDATE)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_safe_v3();

-- 16. Safe backfill for existing auth.users rows that do not have a profile.
-- Defaults role to 'user', status/approval to 'pending', onboarding_completed = false.
-- Never overwrites existing profiles or existing Admin roles.
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  approval_status,
  status,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  'user'::public.user_role,
  'pending'::public.approval_status,
  'pending',
  FALSE,
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================================
-- 17. DIAGNOSTIC QUERIES (Run these to verify the repair state)
-- ============================================================================

-- A. Triggers currently attached to auth.users:
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- B. Function details attached to the signup trigger:
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user_safe_v3';

-- C. Missing auth-user profiles (should return 0 rows):
SELECT u.id, u.email 
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- D. Role and approval enum values:
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;
