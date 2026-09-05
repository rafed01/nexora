-- ============================================================================
-- NEXORA MIGRATION 001: Production Schema (Idempotent & Additive)
-- ============================================================================
-- Description:
--   Preserves all existing data while adding enterprise multi-tenancy,
--   role-based access controls, rich catalog properties, user bookmarks,
--   audit activity logs, and structured access request governance.
--
-- Execution Instructions:
--   Copy and paste this script directly into the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- Ensure required extension for UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SAFE ENUM / ROLE & APPROVAL STATUS HANDLING
-- ============================================================================
-- If an enum type exists, add missing values safely without recreating or dropping.
DO $$
BEGIN
  -- Safe addition of roles if enum 'app_role' or 'user_role' exists in PostgreSQL
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'enterprise'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'employee'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'user'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'advisor'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    -- Temporarily keep legacy roles if already present
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'corporate'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'investor'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'researcher'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'startup'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'expert'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'guest'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'company'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'enterprise'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'advisor'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;

  -- Safe addition of approval_status values if enum exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    BEGIN ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'pending'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'approved'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE approval_status ADD VALUE IF NOT EXISTS 'rejected'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

-- Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. ORGANIZATIONS & MEMBERSHIPS (Multi-Tenancy)
-- ============================================================================
-- Organizations table with approval state and owner
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  slug TEXT UNIQUE,
  tier TEXT DEFAULT 'tier_1',
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  website TEXT,
  domain TEXT,
  industry TEXT,
  description TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(approval_status);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);

-- Organization Memberships table linking employees to an organization
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'employee', 'collaborator')),
  title TEXT,
  department TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_organization_member_user UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- Trigger for organization updated_at
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Trigger for organization_members updated_at
DROP TRIGGER IF EXISTS trg_organization_members_updated_at ON public.organization_members;
CREATE TRIGGER trg_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================================
-- 3. PROFILES TABLE ENRICHMENT
-- ============================================================================
-- Ensure baseline profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additive columns to profiles
DO $$
BEGIN
  -- Organization relationship
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization_id') THEN
    ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;

  -- Approver tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approved_by') THEN
    ALTER TABLE public.profiles ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approved_at') THEN
    ALTER TABLE public.profiles ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rejection_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN rejection_reason TEXT;
  END IF;

  -- User details and display names
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'organization') THEN
    ALTER TABLE public.profiles ADD COLUMN organization TEXT;
  END IF;

  -- Role & approval status columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'approval_status') THEN
    ALTER TABLE public.profiles ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;

  -- Onboarding and profile telemetry
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'metadata') THEN
    ALTER TABLE public.profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tech_stack') THEN
    ALTER TABLE public.profiles ADD COLUMN tech_stack TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'domain_expertise') THEN
    ALTER TABLE public.profiles ADD COLUMN domain_expertise TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'credentials') THEN
    ALTER TABLE public.profiles ADD COLUMN credentials TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tax_id') THEN
    ALTER TABLE public.profiles ADD COLUMN tax_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_approved_by ON public.profiles(approved_by);

-- ============================================================================
-- 4. RICHER CATALOG FIELDS & VALIDATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.catalog (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additive columns to catalog safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'description') THEN
    ALTER TABLE public.catalog ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'category') THEN
    ALTER TABLE public.catalog ADD COLUMN category TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'location') THEN
    ALTER TABLE public.catalog ADD COLUMN location TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'tags') THEN
    ALTER TABLE public.catalog ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'trl') THEN
    ALTER TABLE public.catalog ADD COLUMN trl INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'trl_stage') THEN
    ALTER TABLE public.catalog ADD COLUMN trl_stage TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'metrics') THEN
    ALTER TABLE public.catalog ADD COLUMN metrics JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'milestones') THEN
    ALTER TABLE public.catalog ADD COLUMN milestones TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'deadline') THEN
    ALTER TABLE public.catalog ADD COLUMN deadline TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'budget') THEN
    ALTER TABLE public.catalog ADD COLUMN budget TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'detail') THEN
    ALTER TABLE public.catalog ADD COLUMN detail JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'metadata') THEN
    ALTER TABLE public.catalog ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'status') THEN
    ALTER TABLE public.catalog ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'publication_state') THEN
    ALTER TABLE public.catalog ADD COLUMN publication_state TEXT NOT NULL DEFAULT 'published' CHECK (publication_state IN ('draft', 'published', 'archived', 'in_review'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'organization') THEN
    ALTER TABLE public.catalog ADD COLUMN organization TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'organization_id') THEN
    ALTER TABLE public.catalog ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'created_by') THEN
    ALTER TABLE public.catalog ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'verified_by') THEN
    ALTER TABLE public.catalog ADD COLUMN verified_by TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'access_count') THEN
    ALTER TABLE public.catalog ADD COLUMN access_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog' AND column_name = 'updated_at') THEN
    ALTER TABLE public.catalog ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Indexes for catalog
CREATE INDEX IF NOT EXISTS idx_catalog_type ON public.catalog(type);
CREATE INDEX IF NOT EXISTS idx_catalog_status ON public.catalog(status);
CREATE INDEX IF NOT EXISTS idx_catalog_publication_state ON public.catalog(publication_state);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON public.catalog(category);
CREATE INDEX IF NOT EXISTS idx_catalog_trl ON public.catalog(trl);
CREATE INDEX IF NOT EXISTS idx_catalog_org_id ON public.catalog(organization_id);

-- Trigger for catalog updated_at
DROP TRIGGER IF EXISTS trg_catalog_updated_at ON public.catalog;
CREATE TRIGGER trg_catalog_updated_at
  BEFORE UPDATE ON public.catalog
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================================
-- 5. CATALOG RELATIONSHIPS (Graphs & Interconnections)
-- ============================================================================
-- Connects two catalog items (e.g. Technology solves Challenge, Startup uses Technology)
CREATE TABLE IF NOT EXISTS public.catalog_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL REFERENCES public.catalog(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES public.catalog(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'solves', 'implements', 'spinoff_from', 'collaborates_with', 'sub_technology'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_catalog_relationship UNIQUE (source_id, target_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_cat_rel_source ON public.catalog_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_cat_rel_target ON public.catalog_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_cat_rel_type ON public.catalog_relationships(relationship_type);

-- ============================================================================
-- 6. USER BOOKMARKS (Owned by Users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalog_id TEXT NOT NULL REFERENCES public.catalog(id) ON DELETE CASCADE,
  folder TEXT DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_catalog_bookmark UNIQUE (user_id, catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_catalog ON public.bookmarks(catalog_id);

-- ============================================================================
-- 7. USER ACTIVITY AUDIT (Owned by Users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'view', 'bookmark', 'request_access', 'scout_query', 'download_report', 'proposal_submit'
  entity_type TEXT,     -- 'technology', 'startup', 'expert', 'challenge', 'report'
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);

-- ============================================================================
-- 8. STRUCTURED ACCESS REQUESTS ENRICHMENT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add additive structured fields to requests safely
DO $$
BEGIN
  -- Requester identity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'requester_id') THEN
    ALTER TABLE public.requests ADD COLUMN requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'user_id') THEN
    ALTER TABLE public.requests ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Target catalog item
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'catalog_id') THEN
    ALTER TABLE public.requests ADD COLUMN catalog_id TEXT REFERENCES public.catalog(id) ON DELETE SET NULL;
  END IF;

  -- Request classifications
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'request_type') THEN
    ALTER TABLE public.requests ADD COLUMN request_type TEXT NOT NULL DEFAULT 'access_briefing' CHECK (request_type IN ('access_briefing', 'nda', 'collaboration_proposal', 'due_diligence', 'report_download'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'status') THEN
    ALTER TABLE public.requests ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_review', 'cancelled'));
  END IF;

  -- Recipient organization
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'recipient_organization_id') THEN
    ALTER TABLE public.requests ADD COLUMN recipient_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;

  -- Structured payload
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'payload') THEN
    ALTER TABLE public.requests ADD COLUMN payload JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Decision data
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'decided_by') THEN
    ALTER TABLE public.requests ADD COLUMN decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'decided_at') THEN
    ALTER TABLE public.requests ADD COLUMN decided_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'decision_notes') THEN
    ALTER TABLE public.requests ADD COLUMN decision_notes TEXT;
  END IF;

  -- Plain text fields for backward compatibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'name') THEN
    ALTER TABLE public.requests ADD COLUMN name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'email') THEN
    ALTER TABLE public.requests ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'organization') THEN
    ALTER TABLE public.requests ADD COLUMN organization TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'proposal_brief') THEN
    ALTER TABLE public.requests ADD COLUMN proposal_brief TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'updated_at') THEN
    ALTER TABLE public.requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_catalog ON public.requests(catalog_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON public.requests(request_type);
CREATE INDEX IF NOT EXISTS idx_requests_recipient_org ON public.requests(recipient_organization_id);

-- Trigger for requests updated_at
DROP TRIGGER IF EXISTS trg_requests_updated_at ON public.requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================================================
-- 9. SECURE ON-SIGNUP TRIGGER (NEVER GRANTS ADMIN TO PUBLIC SIGNUP)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    assigned_role,
    assigned_status,
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
      WHEN public.profiles.role::TEXT = 'admin' THEN 'admin'::TEXT
      ELSE EXCLUDED.role
    END,
    organization_id = COALESCE(public.profiles.organization_id, EXCLUDED.organization_id),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rebind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
-- Uses role::TEXT to ensure compatibility when 'admin' was added to an existing enum in the same migration
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::TEXT = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations policies
DROP POLICY IF EXISTS "Public can view approved organizations" ON public.organizations;
CREATE POLICY "Public can view approved organizations"
  ON public.organizations FOR SELECT
  USING (approval_status = 'approved' OR auth.uid() = owner_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (public.is_admin() OR auth.uid() = owner_id);

-- Bookmarks policies (User owns their bookmarks)
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage own bookmarks"
  ON public.bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Activity policies (User views and logs own actions)
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
CREATE POLICY "Users can view own activity"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity;
CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Catalog Relationships policies (Public readable)
DROP POLICY IF EXISTS "Public can view catalog relationships" ON public.catalog_relationships;
CREATE POLICY "Public can view catalog relationships"
  ON public.catalog_relationships FOR SELECT
  USING (true);

-- Requests policies (Requesters, recipient orgs, and admins can view)
DROP POLICY IF EXISTS "Users view own submitted requests" ON public.requests;
CREATE POLICY "Users view own submitted requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id 
    OR auth.uid() = user_id 
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = public.requests.recipient_organization_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users create requests" ON public.requests;
CREATE POLICY "Users create requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = user_id OR requester_id IS NULL);

-- ============================================================================
-- 11. READ-ONLY VERIFICATION QUERIES
-- ============================================================================
-- Check table column definitions
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('organizations', 'organization_members', 'profiles', 'catalog', 'catalog_relationships', 'bookmarks', 'user_activity', 'requests')
-- ORDER BY table_name, ordinal_position;

-- Check all active constraints
-- SELECT conname, contype, conrelid::regclass 
-- FROM pg_constraint 
-- WHERE connamespace = 'public'::regnamespace;

-- Check all RLS policies
-- SELECT tablename, policyname, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
