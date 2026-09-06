import 'server-only';
import { createClient as createServerSupabaseClient } from './server';
import { createAdminClient } from './admin';
import type { UserProfile, UserRole, ApprovalStatus } from '../supabaseClient';

export interface AuthContextUser {
  id: string;
  email: string;
  role: UserRole;
  approval_status: ApprovalStatus;
  organization_id?: string | null;
  organization?: string | null;
  full_name?: string | null;
  onboarding_completed?: boolean;
}

export type AuthOutcome<T = AuthContextUser> = 
  | { authorized: true; user: T; error?: never; status?: never }
  | { authorized: false; user?: never; error: string; status: 401 | 403 };

/**
 * 1. getCurrentUser
 * Retrieves the currently authenticated user from verified Supabase session cookies
 * and loads their genuine database profile.
 * Rejects unverified tokens or missing profiles.
 */
export async function getCurrentUser(): Promise<AuthContextUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return null;

    // Use getUser() to guarantee server-side cryptographic token verification
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Load actual profile from protected profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, approval_status, organization_id, organization, full_name, onboarding_completed')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError || !profile) {
      // Return bare auth identity with 'user' pending default if profile record is still syncing
      return {
        id: authUser.id,
        email: authUser.email || '',
        role: 'user',
        approval_status: 'pending',
        organization_id: null,
        organization: null,
        full_name: null,
        onboarding_completed: false,
      };
    }

    return {
      id: profile.id,
      email: profile.email || authUser.email || '',
      role: (profile.role as UserRole) || 'user',
      approval_status: (profile.approval_status as ApprovalStatus) || 'pending',
      organization_id: profile.organization_id || null,
      organization: profile.organization || null,
      full_name: profile.full_name || null,
      onboarding_completed: Boolean(profile.onboarding_completed),
    };
  } catch (err) {
    console.error('Error in getCurrentUser server helper:', err);
    return null;
  }
}

/**
 * 2. requireApprovedUser
 * Ensures the user has a verified session AND has an 'approved' status (or is admin).
 */
export async function requireApprovedUser(): Promise<AuthOutcome> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      error: 'Authentication required. Please sign in.',
      status: 401,
    };
  }

  // Admins bypass standard approval hold
  if (user.role === 'admin') {
    return { authorized: true, user };
  }

  if (user.approval_status !== 'approved') {
    return {
      authorized: false,
      error: 'Account approval pending. Access restricted until verified.',
      status: 403,
    };
  }

  return { authorized: true, user };
}

/**
 * 3. requirePlatformAdmin
 * Requires the authenticated user to hold the 'admin' role in their verified database profile.
 * Email strings, cookies, metadata, and local values are completely ignored.
 */
export async function requirePlatformAdmin(): Promise<AuthOutcome> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      error: 'Authentication required. Please sign in.',
      status: 401,
    };
  }

  if (user.role !== 'admin') {
    return {
      authorized: false,
      error: 'Forbidden: Platform Administrator privileges required.',
      status: 403,
    };
  }

  return { authorized: true, user };
}

export type EnterpriseAuthOutcome =
  | { authorized: true; user: AuthContextUser; organizationId: string | null }
  | { authorized: false; user?: never; organizationId?: never; error: string; status: 401 | 403 | 404 };

/**
 * 4. requireEnterpriseOrgAuthority
 * Resolves enterprise organization-management authority strictly from verified database records.
 *
 * - Platform Admins may explicitly pass `requestedOrgId` to inspect any organization (their identity
 *   and role are still cryptographically verified server-side via getCurrentUser()).
 * - Non-admin callers (enterprise owners/admins) NEVER get to choose which organization they manage:
 *   `requestedOrgId` is ignored entirely for them. Their managed organization is derived only from
 *   their own verified profile (`organization_id`) plus a matching `organization_members` row with
 *   `owner` or `admin` role. This prevents a browser-supplied orgId from granting authority it wasn't
 *   independently proven to hold.
 */
export async function requireEnterpriseOrgAuthority(requestedOrgId?: string | null): Promise<EnterpriseAuthOutcome> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      error: 'Authentication required. Please sign in.',
      status: 401,
    };
  }

  // Platform admin: explicitly verified server-side via the database role, may target any org.
  if (user.role === 'admin') {
    return { authorized: true, user, organizationId: requestedOrgId || null };
  }

  // 'company' is a legacy synonym for 'enterprise' still present on older profile rows.
  if (user.role !== 'enterprise' && user.role !== 'company') {
    return {
      authorized: false,
      error: 'Forbidden: Enterprise organization management authority required.',
      status: 403,
    };
  }

  if (user.approval_status !== 'approved') {
    return {
      authorized: false,
      error: 'Forbidden: Your enterprise account is pending approval.',
      status: 403,
    };
  }

  if (!user.organization_id) {
    return {
      authorized: false,
      error: 'Forbidden: No organization is linked to your account yet.',
      status: 403,
    };
  }

  // Confirm owner/admin membership in organization_members for the caller's own linked organization.
  try {
    const adminDb = createAdminClient();
    const { data: memberRecord } = await adminDb
      .from('organization_members')
      .select('role')
      .eq('organization_id', user.organization_id)
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .maybeSingle();

    if (memberRecord) {
      return { authorized: true, user, organizationId: user.organization_id };
    }
  } catch (err) {
    console.error('Error verifying enterprise authority:', err);
  }

  return {
    authorized: false,
    error: 'Forbidden: You do not possess management authority for this organization.',
    status: 403,
  };
}
