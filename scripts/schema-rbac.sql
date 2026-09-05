-- ============================================================================
-- NEXORA COMPLETE SUPABASE SCHEMA (Catalog, Access Requests, Profiles & RBAC)
-- ============================================================================
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================================

-- 1. Catalog Table (Technologies, Startups, Experts, Challenges, Reports)
CREATE TABLE IF NOT EXISTS public.catalog (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  trl INTEGER,
  trl_stage TEXT,
  "trlStage" TEXT,
  organization TEXT,
  location TEXT,
  description TEXT,
  tags TEXT[],
  metrics JSONB,
  milestones TEXT[],
  budget TEXT,
  deadline TEXT,
  verified_by TEXT,
  "verifiedBy" TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Access Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  proposal_brief TEXT,
  "proposalBrief" TEXT,
  purpose TEXT,
  entity_title TEXT,
  "entityTitle" TEXT,
  entity_type TEXT,
  "entityType" TEXT,
  nda_status TEXT,
  "ndaStatus" TEXT,
  tier_requested TEXT,
  "tierRequested" TEXT,
  role_requested TEXT,
  "roleRequested" TEXT,
  status TEXT DEFAULT 'Pending',
  date_requested TEXT,
  "dateRequested" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for catalog & requests
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to catalog" ON public.catalog;
CREATE POLICY "Public read access to catalog" ON public.catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated and Service role access to catalog" ON public.catalog;
CREATE POLICY "Authenticated and Service role access to catalog" ON public.catalog FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role access to requests" ON public.requests;
CREATE POLICY "Service role access to requests" ON public.requests FOR ALL USING (true);

-- 3. Create Profiles Table Linked to auth.users with Approval Gates & Progressive Onboarding
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'researcher' CHECK (role IN ('guest', 'researcher', 'advisor', 'company', 'enterprise', 'admin')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_status TEXT DEFAULT 'approved',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  domain_expertise TEXT,
  credentials TEXT,
  tax_id TEXT,
  tech_stack TEXT[],
  interest_tags TEXT[],
  bio TEXT,
  tier_requested TEXT,
  sponsor_organization TEXT,
  sponsor_notes TEXT,
  nda_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns safely if upgrading existing table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'approved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tech_stack') THEN
    ALTER TABLE public.profiles ADD COLUMN tech_stack TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interest_tags') THEN
    ALTER TABLE public.profiles ADD COLUMN interest_tags TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- 4. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Security Policies
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile details
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins have full access to profiles
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service Role / Server has unrestricted access
DROP POLICY IF EXISTS "Service role bypass on profiles" ON public.profiles;
CREATE POLICY "Service role bypass on profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true);

-- 7. Automated User Creation Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  assigned_status TEXT;
  onboarding_flag BOOLEAN;
  user_full_name TEXT;
  user_org TEXT;
  user_domain TEXT;
  user_creds TEXT;
  user_tax_id TEXT;
BEGIN
  -- Extract metadata safely
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'researcher');
  
  -- Fallback check
  IF assigned_role NOT IN ('guest', 'researcher', 'advisor', 'company', 'enterprise', 'admin') THEN
    assigned_role := 'researcher';
  END IF;

  -- Gating rule: Advisors and Companies start as 'pending'
  IF assigned_role IN ('advisor', 'company', 'enterprise') THEN
    assigned_status := 'pending';
    onboarding_flag := FALSE;
  ELSIF assigned_role = 'admin' THEN
    assigned_status := 'approved';
    onboarding_flag := TRUE;
  ELSE
    assigned_status := 'approved';
    onboarding_flag := FALSE;
  END IF;

  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name');
  user_org := new.raw_user_meta_data->>'organization';
  user_domain := new.raw_user_meta_data->>'domain_expertise';
  user_creds := new.raw_user_meta_data->>'credentials';
  user_tax_id := new.raw_user_meta_data->>'tax_id';

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    organization,
    role,
    status,
    approval_status,
    onboarding_completed,
    domain_expertise,
    credentials,
    tax_id,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    user_full_name,
    user_org,
    assigned_role,
    assigned_status,
    assigned_status,
    onboarding_flag,
    user_domain,
    user_creds,
    user_tax_id,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    organization = COALESCE(EXCLUDED.organization, public.profiles.organization),
    role = CASE 
      WHEN public.profiles.role = 'admin' AND EXCLUDED.role != 'admin' THEN public.profiles.role
      ELSE EXCLUDED.role
    END,
    status = COALESCE(public.profiles.status, EXCLUDED.status),
    onboarding_completed = COALESCE(public.profiles.onboarding_completed, EXCLUDED.onboarding_completed),
    domain_expertise = COALESCE(EXCLUDED.domain_expertise, public.profiles.domain_expertise),
    credentials = COALESCE(EXCLUDED.credentials, public.profiles.credentials),
    tax_id = COALESCE(EXCLUDED.tax_id, public.profiles.tax_id),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Helper Function to get current user clearance
CREATE OR REPLACE FUNCTION public.get_current_user_clearance()
RETURNS TABLE (user_role TEXT, user_status TEXT, is_onboarded BOOLEAN) AS $$
  SELECT role, status, onboarding_completed FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
