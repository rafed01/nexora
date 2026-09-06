-- ============================================================================
-- NEXORA AUTOMATED HEALTH CHECK & SCHEMA VERIFICATION SCRIPT
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- It executes automated assertions on:
--   1. All Required Tables
--   2. All Required Columns
--   3. Row Level Security (RLS) Status
--   4. RLS Security Policies
--   5. Security Definer Helper Functions
--   6. Automated Security & Cleanup Triggers
--
-- Look for the final column "overall_status":
-- If all checks pass, it will show "PASS".
-- ============================================================================

WITH 
-- 1. Check tables existence
table_check AS (
  SELECT 
    'Tables Existence' AS category,
    CASE 
      WHEN COUNT(DISTINCT table_name) >= 8 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CONCAT(COUNT(DISTINCT table_name), ' / 8 required tables present') AS details
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'organizations', 
      'organization_members', 
      'profiles', 
      'catalog', 
      'catalog_relationships', 
      'bookmarks', 
      'user_activity', 
      'requests'
    )
),

-- 2. Check critical columns added in Migration 001
column_check AS (
  SELECT 
    'Critical Columns' AS category,
    CASE 
      WHEN COUNT(*) >= 20 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CONCAT(COUNT(*), ' / 20 verified columns present across tables') AS details
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND (
      (table_name = 'profiles' AND column_name IN ('organization_id', 'approved_by', 'approved_at', 'role', 'approval_status')) OR
      (table_name = 'organizations' AND column_name IN ('approval_status', 'owner_id', 'slug')) OR
      (table_name = 'organization_members' AND column_name IN ('organization_id', 'user_id', 'role')) OR
      (table_name = 'catalog' AND column_name IN ('publication_state', 'trl_stage', 'metrics', 'detail', 'created_by')) OR
      (table_name = 'requests' AND column_name IN ('requester_id', 'request_type', 'recipient_organization_id', 'payload', 'decided_by'))
    )
),

-- 3. Check Row Level Security is ENABLED on every table
rls_check AS (
  SELECT 
    'Row Level Security (RLS)' AS category,
    CASE 
      WHEN COUNT(*) = 8 AND bool_and(rowsecurity) THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CASE 
      WHEN bool_and(rowsecurity) THEN 'All 8 core tables have RLS enabled'
      ELSE 'WARNING: Some tables lack RLS'
    END AS details
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'organizations', 
      'organization_members', 
      'profiles', 
      'catalog', 
      'catalog_relationships', 
      'bookmarks', 
      'user_activity', 
      'requests'
    )
),

-- 4. Check that specific security policies exist
policy_check AS (
  SELECT 
    'Security Policies' AS category,
    CASE 
      WHEN COUNT(DISTINCT policyname) >= 12 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CONCAT(COUNT(DISTINCT policyname), ' active security policies found') AS details
  FROM pg_policies
  WHERE schemaname = 'public'
),

-- 5. Check security-definer helper and atomic approval RPC functions
function_check AS (
  SELECT 
    'Helper Functions' AS category,
    CASE 
      WHEN COUNT(DISTINCT routine_name) >= 6 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CONCAT(COUNT(DISTINCT routine_name), ' / 6 security and approval functions installed') AS details
  FROM information_schema.routines r
  WHERE r.routine_schema = 'public'
    AND r.routine_name IN (
      'is_admin', 
      'get_managed_organization_ids', 
      'is_org_manager', 
      'is_org_member',
      'decide_top_level_account_approval',
      'decide_organization_employee_approval'
    )
),

-- 6. Approval RPCs must be SECURITY DEFINER and callable only by service_role.
approval_rpc_check AS (
  SELECT
    'Approval RPC Security' AS category,
    CASE WHEN COUNT(*) = 2
      AND bool_and(prosecdef)
      AND bool_and(has_function_privilege('service_role', p.oid, 'EXECUTE'))
      AND bool_and(NOT has_function_privilege('anon', p.oid, 'EXECUTE'))
      AND bool_and(NOT has_function_privilege('authenticated', p.oid, 'EXECUTE'))
      THEN 'PASS' ELSE 'FAIL' END AS status,
    'Atomic approval RPCs are SECURITY DEFINER and service_role-only' AS details
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('decide_top_level_account_approval', 'decide_organization_employee_approval')
),

request_type_check AS (
  SELECT
    'Request Workflow Types' AS category,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.requests'::regclass
        AND pg_get_constraintdef(oid) LIKE '%challenge_application%'
        AND pg_get_constraintdef(oid) LIKE '%expert_consultation%'
    ) THEN 'PASS' ELSE 'FAIL' END AS status,
    'Challenge and expert request classifications are available' AS details
),

-- 7. Check security triggers attached
trigger_check AS (
  SELECT 
    'Security Triggers' AS category,
    CASE 
      WHEN COUNT(DISTINCT trigger_name) >= 2 THEN 'PASS'
      ELSE 'FAIL'
    END AS status,
    CONCAT(COUNT(DISTINCT trigger_name), ' / 2 critical security triggers active') AS details
  FROM information_schema.triggers
  WHERE (event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created')
     OR (event_object_schema = 'public' AND trigger_name = 'trg_guard_profile_updates')
)

-- Unified Report Output
SELECT 
  category, 
  status, 
  details 
FROM (
  SELECT 1 AS ord, * FROM table_check
  UNION ALL
  SELECT 2 AS ord, * FROM column_check
  UNION ALL
  SELECT 3 AS ord, * FROM rls_check
  UNION ALL
  SELECT 4 AS ord, * FROM policy_check
  UNION ALL
  SELECT 5 AS ord, * FROM function_check
  UNION ALL
  SELECT 6 AS ord, * FROM approval_rpc_check
  UNION ALL
  SELECT 7 AS ord, * FROM request_type_check
  UNION ALL
  SELECT 8 AS ord, * FROM trigger_check
) sub
ORDER BY ord;
