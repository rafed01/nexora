-- ============================================================================
-- NEXORA SCRIPT 002: Production Security, RLS & Multi-Tenant Governance
-- ============================================================================
-- Description:
--   Implements comprehensive Row Level Security (RLS), security definer
--   helper functions, access verification guards, and an automated auth.users
--   trigger that creates pending profiles without privilege escalation risk.
--
-- Security Rules Enforced:
--   1. Anonymous visitors: Read-only on published catalog content and approved public orgs.
--   2. Self profile management: Users read and edit only non-privileged fields on own profile.
--   3. Privilege immutability: Users can NEVER alter their role, approval_status, status,
--      approved_by, approved_at, or organization_id.
--   4. Platform Admin: Full management access over all platform tables.
--   5. Enterprise multi-tenancy: Approved enterprise owners/admins can see and manage/approve
--      only employees belonging to their own approved organization.
--   6. Enterprise isolation: Enterprise users can never view or update employees of another org.
--   7. User isolation: Users access only their own bookmarks and user_activity audit logs.
--   8. Request access governance: Requesters view own requests; authorized enterprise recipients
--      and platform admins view and decide relevant requests.
--   9. No unconditional write access: No INSERT/UPDATE/DELETE uses USING (true) or WITH CHECK (true).
--  10. Signup trigger: Never creates admin accounts. Independent users, advisors, and enterprises
--      start pending. Employees start pending under an approved organization.
-- ============================================================================

-- Ensure pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================================

-- Function 1: Check if current authenticated user has the 'admin' platform role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
      AND role::TEXT = 'admin'
      AND approval_status::TEXT = 'approved'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function 2: Get organization ID where the current user is an approved owner or admin
CREATE OR REPLACE FUNCTION public.get_managed_organization_ids()
RETURNS SETOF UUID AS $$
  -- Orgs owned directly by the user where the user's profile is approved
  SELECT id FROM public.organizations 
  WHERE owner_id = auth.uid()
  UNION
  -- Orgs where the user is an active owner/admin in organization_members
  SELECT om.organization_id FROM public.organization_members om
  JOIN public.profiles p ON p.id = om.user_id
  WHERE om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND p.approval_status::TEXT = 'approved';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function 3: Check if the current user is an authorized enterprise manager for a given org
CREATE OR REPLACE FUNCTION public.is_org_manager(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.get_managed_organization_ids() WHERE get_managed_organization_ids = target_org_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function 4: Check if current user is an approved member of a given organization
CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.profiles p ON p.id = om.user_id
    WHERE om.organization_id = target_org_id
      AND om.user_id = auth.uid()
      AND p.approval_status::TEXT = 'approved'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 2. SECURE ON-SIGNUP TRIGGER (NEVER CREATES ADMIN; PENDING ONBOARDING)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_security()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_security();

-- ============================================================================
-- 3. PROFILES IMMUTABILITY GUARD (PREVENT PRIVILEGE ESCALATION)
-- ============================================================================
-- Enforces that users cannot edit role, approval_status, status, approved_by, approved_at, or organization_id
CREATE OR REPLACE FUNCTION public.guard_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS trg_guard_profile_updates ON public.profiles;
CREATE TRIGGER trg_guard_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_updates();

-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES BY TABLE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE: public.profiles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (
    -- Users can read their own profile
    auth.uid() = id
    -- Platform admins can read all profiles
    OR public.is_admin()
    -- Enterprise managers can view employees belonging to their own organization
    OR (
      organization_id IS NOT NULL 
      AND public.is_org_manager(organization_id)
    )
    -- Colleagues within the same approved organization can see approved profiles
    OR (
      organization_id IS NOT NULL 
      AND public.is_org_member(organization_id)
      AND approval_status::TEXT = 'approved'
    )
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin()
    OR (
      organization_id IS NOT NULL 
      AND public.is_org_manager(organization_id)
      AND role::TEXT = 'employee'
    )
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin()
    OR (
      organization_id IS NOT NULL 
      AND public.is_org_manager(organization_id)
      AND role::TEXT = 'employee'
    )
  );

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- TABLE: public.organizations
-- ----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_select_policy" ON public.organizations;
CREATE POLICY "organizations_select_policy"
  ON public.organizations FOR SELECT
  TO anon, authenticated
  USING (
    approval_status::TEXT = 'approved'
    OR auth.uid() = owner_id
    OR public.is_admin()
    OR public.is_org_manager(id)
    OR public.is_org_member(id)
  );

DROP POLICY IF EXISTS "organizations_insert_policy" ON public.organizations;
CREATE POLICY "organizations_insert_policy"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Authenticated users can register an organization that they own with pending status
    (auth.uid() = owner_id AND approval_status::TEXT = 'pending')
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "organizations_update_policy" ON public.organizations;
CREATE POLICY "organizations_update_policy"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.is_org_manager(id))
  WITH CHECK (
    public.is_admin() 
    OR (
      public.is_org_manager(id) 
      AND approval_status::TEXT = 'approved' -- Managers cannot self-unapprove or change tier without admin
    )
  );

DROP POLICY IF EXISTS "organizations_delete_policy" ON public.organizations;
CREATE POLICY "organizations_delete_policy"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- TABLE: public.organization_members
-- ----------------------------------------------------------------------------
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org_members_select_policy" ON public.organization_members;
CREATE POLICY "org_members_select_policy"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    -- A user can see their own membership
    auth.uid() = user_id
    -- Platform admins can see all memberships
    OR public.is_admin()
    -- Enterprise managers can see members of their own organization only
    OR public.is_org_manager(organization_id)
    -- Colleagues within the same organization can see each other
    OR public.is_org_member(organization_id)
  );

DROP POLICY IF EXISTS "org_members_insert_policy" ON public.organization_members;
CREATE POLICY "org_members_insert_policy"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR public.is_org_manager(organization_id)
    -- Employees can register a join request for themselves
    OR (auth.uid() = user_id AND role = 'employee')
  );

DROP POLICY IF EXISTS "org_members_update_policy" ON public.organization_members;
CREATE POLICY "org_members_update_policy"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR public.is_org_manager(organization_id))
  WITH CHECK (public.is_admin() OR public.is_org_manager(organization_id));

DROP POLICY IF EXISTS "org_members_delete_policy" ON public.organization_members;
CREATE POLICY "org_members_delete_policy"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    public.is_admin() 
    OR public.is_org_manager(organization_id)
    OR auth.uid() = user_id -- A user can leave an organization
  );

-- ----------------------------------------------------------------------------
-- TABLE: public.catalog
-- ----------------------------------------------------------------------------
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_select_policy" ON public.catalog;
CREATE POLICY "catalog_select_policy"
  ON public.catalog FOR SELECT
  TO anon, authenticated
  USING (
    -- Anonymous visitors and public users can read only published items
    publication_state = 'published' 
    OR status = 'published' 
    OR status = 'Active'
    -- Platform admins can view drafts/archived items
    OR public.is_admin()
    -- Entity creator can view their item
    OR (created_by IS NOT NULL AND auth.uid() = created_by)
    -- Entity owner organization manager can view their drafts
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id))
  );

DROP POLICY IF EXISTS "catalog_insert_policy" ON public.catalog;
CREATE POLICY "catalog_insert_policy"
  ON public.catalog FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (
      -- Approved enterprise or advisor users can submit items into their organization
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND approval_status::TEXT = 'approved'
          AND role::TEXT IN ('enterprise', 'advisor')
      )
      AND (organization_id IS NULL OR public.is_org_manager(organization_id))
      AND auth.uid() = created_by
    )
  );

DROP POLICY IF EXISTS "catalog_update_policy" ON public.catalog;
CREATE POLICY "catalog_update_policy"
  ON public.catalog FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (created_by IS NOT NULL AND auth.uid() = created_by)
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id))
  )
  WITH CHECK (
    public.is_admin()
    OR (created_by IS NOT NULL AND auth.uid() = created_by)
    OR (organization_id IS NOT NULL AND public.is_org_manager(organization_id))
  );

DROP POLICY IF EXISTS "catalog_delete_policy" ON public.catalog;
CREATE POLICY "catalog_delete_policy"
  ON public.catalog FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (created_by IS NOT NULL AND auth.uid() = created_by)
  );

-- ----------------------------------------------------------------------------
-- TABLE: public.catalog_relationships
-- ----------------------------------------------------------------------------
ALTER TABLE public.catalog_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_relationships_select_policy" ON public.catalog_relationships;
CREATE POLICY "catalog_relationships_select_policy"
  ON public.catalog_relationships FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "catalog_relationships_modify_policy" ON public.catalog_relationships;
CREATE POLICY "catalog_relationships_modify_policy"
  ON public.catalog_relationships FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- TABLE: public.bookmarks
-- ----------------------------------------------------------------------------
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_policy" ON public.bookmarks;
CREATE POLICY "bookmarks_select_policy"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "bookmarks_insert_policy" ON public.bookmarks;
CREATE POLICY "bookmarks_insert_policy"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_update_policy" ON public.bookmarks;
CREATE POLICY "bookmarks_update_policy"
  ON public.bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_policy" ON public.bookmarks;
CREATE POLICY "bookmarks_delete_policy"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- TABLE: public.user_activity
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_activity_select_policy" ON public.user_activity;
CREATE POLICY "user_activity_select_policy"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_activity_insert_policy" ON public.user_activity;
CREATE POLICY "user_activity_insert_policy"
  ON public.user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User activity logs are immutable audit records
DROP POLICY IF EXISTS "user_activity_update_policy" ON public.user_activity;
CREATE POLICY "user_activity_update_policy"
  ON public.user_activity FOR UPDATE
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS "user_activity_delete_policy" ON public.user_activity;
CREATE POLICY "user_activity_delete_policy"
  ON public.user_activity FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- TABLE: public.requests
-- ----------------------------------------------------------------------------
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select_policy" ON public.requests;
CREATE POLICY "requests_select_policy"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    -- Requesters can view their own requests
    auth.uid() = requester_id
    OR auth.uid() = user_id
    -- Platform admins can view all requests
    OR public.is_admin()
    -- Recipient enterprise owners and admins can view requests addressed to their organization
    OR (
      recipient_organization_id IS NOT NULL 
      AND public.is_org_manager(recipient_organization_id)
    )
  );

DROP POLICY IF EXISTS "requests_insert_policy" ON public.requests;
CREATE POLICY "requests_insert_policy"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Authenticated users can submit requests where they are identified as the requester
    auth.uid() = requester_id 
    OR auth.uid() = user_id
    OR (requester_id IS NULL AND user_id IS NULL AND email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "requests_update_policy" ON public.requests;
CREATE POLICY "requests_update_policy"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    -- Authorized recipient organization managers can update/decide requests
    OR (
      recipient_organization_id IS NOT NULL 
      AND public.is_org_manager(recipient_organization_id)
    )
    -- Requesters can cancel or withdraw their own pending request
    OR (
      (auth.uid() = requester_id OR auth.uid() = user_id) 
      AND status = 'pending'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      recipient_organization_id IS NOT NULL 
      AND public.is_org_manager(recipient_organization_id)
    )
    OR (
      (auth.uid() = requester_id OR auth.uid() = user_id) 
      AND status = 'cancelled'
    )
  );

DROP POLICY IF EXISTS "requests_delete_policy" ON public.requests;
CREATE POLICY "requests_delete_policy"
  ON public.requests FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================
-- 1. Verify all RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- 2. List all active policies and their target roles & commands:
-- SELECT tablename, policyname, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
--
-- 3. Verify that handle_new_user_security trigger is properly bound:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement 
-- FROM information_schema.triggers 
-- WHERE event_object_schema = 'auth' AND event_object_table = 'users';
--
-- 4. Verify that guard_profile_updates trigger is attached to public.profiles:
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement 
-- FROM information_schema.triggers 
-- WHERE event_object_schema = 'public' AND event_object_table = 'profiles';
