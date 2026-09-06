import { NextRequest, NextResponse } from 'next/server';
import { requireEnterpriseOrgAuthority } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Enterprise Organization Management API
 *
 * Protected endpoint: only accessible by an approved Enterprise owner/admin for
 * their own linked organization, or by a Platform Admin (explicitly verified
 * server-side). The managed organization is always derived from verified
 * database records (profile.organization_id + organization_members authority) —
 * a browser-supplied `orgId` is never trusted as authority for non-admin callers.
 *
 * GET  /api/organizations/manage           -> organization + pending/approved/rejected employees
 * POST /api/organizations/manage           -> { employeeId, decision: 'approved'|'rejected', reason? }
 */

const EMPLOYEE_SELECT =
  'id, email, full_name, role, approval_status, status, organization_id, created_at, approved_at, approved_by, rejection_reason';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get('orgId');

    const authOutcome = await requireEnterpriseOrgAuthority(requestedOrgId);
    if (!authOutcome.authorized) {
      return NextResponse.json({ error: authOutcome.error }, { status: authOutcome.status });
    }

    const organizationId = authOutcome.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'orgId query parameter is required for platform administrator access.' },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();

    const { data: org, error: orgError } = await adminDb
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .maybeSingle();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      adminDb
        .from('profiles')
        .select(EMPLOYEE_SELECT)
        .eq('organization_id', organizationId)
        .eq('role', 'employee')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false }),
      adminDb
        .from('profiles')
        .select(EMPLOYEE_SELECT)
        .eq('organization_id', organizationId)
        .eq('role', 'employee')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false }),
      adminDb
        .from('profiles')
        .select(EMPLOYEE_SELECT)
        .eq('organization_id', organizationId)
        .eq('role', 'employee')
        .eq('approval_status', 'rejected')
        .order('created_at', { ascending: false }),
    ]);

    if (pendingRes.error || approvedRes.error || rejectedRes.error) {
      const err = pendingRes.error || approvedRes.error || rejectedRes.error;
      console.error('Error fetching organization employees:', err?.message);
      return NextResponse.json({ error: 'Database error fetching employees' }, { status: 500 });
    }

    return NextResponse.json({
      organization: org,
      pending: pendingRes.data || [],
      approved: approvedRes.data || [],
      rejected: rejectedRes.data || [],
    });
  } catch (error: any) {
    console.error('Error in enterprise organization management GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get('orgId');

    const body = await request.json();
    const { employeeId, decision, reason } = body;

    if (!employeeId || typeof employeeId !== 'string') {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json({ error: "decision must be 'approved' or 'rejected'" }, { status: 400 });
    }

    const authOutcome = await requireEnterpriseOrgAuthority(requestedOrgId);
    if (!authOutcome.authorized) {
      return NextResponse.json({ error: authOutcome.error }, { status: authOutcome.status });
    }

    const organizationId = authOutcome.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'orgId query parameter is required for platform administrator access.' },
        { status: 400 }
      );
    }

    const adminDb = createAdminClient();
    const { data: result, error: rpcError } = await adminDb.rpc(
      'decide_organization_employee_approval',
      {
        p_target_profile_id: employeeId,
        p_decision: decision,
        p_reason: typeof reason === 'string' ? reason : null,
        p_manager_id: authOutcome.user.id,
        p_organization_id: organizationId,
      }
    );

    if (rpcError) {
      console.error('Error executing atomic employee approval:', rpcError.message);
      return NextResponse.json({ error: 'Failed to save decision.' }, { status: 500 });
    }

    const resultCode = result?.code;
    const statusByCode: Record<string, number> = {
      not_found: 404,
      forbidden_target: 403,
      already_decided: 409,
    };
    if (!result?.success) {
      return NextResponse.json(
        { error: result?.message || 'Failed to save decision.', code: resultCode },
        { status: statusByCode[resultCode] || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: result.profile,
      decision,
      decidedBy: authOutcome.user.id,
      decidedAt: result.decided_at,
    });
  } catch (error: any) {
    console.error('Error in enterprise organization management POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
