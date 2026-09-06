import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Platform Admin Account Approvals API
 * 
 * GET /api/admin/approvals
 * Lists all pending top-level accounts:
 * - Includes: pending enterprises, independent users, advisors.
 * - Excludes: organization employees awaiting enterprise approval (role === 'employee' or having an organization_id).
 * 
 * POST /api/admin/approvals
 * Approves or rejects a pending top-level account:
 * - Updates Supabase profile (status, approver ID, decision timestamp, rejection reason).
 * - Never accepts acting admin identity or role from client request body.
 * - Returns updated record.
 */

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Platform Admin authorization strictly server-side
    const adminAuth = await requirePlatformAdmin();
    if (!adminAuth.authorized) {
      return NextResponse.json(
        { error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const adminSupabase = createAdminClient();

    // Query profiles that are 'pending'
    // Allowed roles: 'user', 'advisor', 'company', 'enterprise'
    // Excluded: 'employee' and anyone with an organization_id assigned (employee awaiting enterprise approval)
    const { data: profiles, error } = await adminSupabase
      .from('profiles')
      .select('id, email, role, approval_status, full_name, organization, organization_id, domain_expertise, credentials, advisory_history, linkedin_url, company_name, tax_id, company_size, industry, focus_area, created_at, updated_at, metadata')
      .eq('approval_status', 'pending')
      .is('organization_id', null)
      .neq('role', 'employee')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying pending top-level profiles:', error.message);
      return NextResponse.json(
        { error: `Database error querying queue: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      queue: profiles || [],
      count: profiles ? profiles.length : 0,
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Platform Admin authorization strictly server-side
    const adminAuth = await requirePlatformAdmin();
    if (!adminAuth.authorized) {
      return NextResponse.json(
        { error: adminAuth.error },
        { status: adminAuth.status }
      );
    }

    const actingAdmin = adminAuth.user;

    // 2. Parse request payload
    const body = await request.json();
    const { userId, decision, reason } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json(
        { error: "decision must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data: result, error: rpcError } = await adminSupabase.rpc(
      'decide_top_level_account_approval',
      {
        p_target_profile_id: userId,
        p_decision: decision,
        p_reason: typeof reason === 'string' ? reason : null,
        p_acting_admin_id: actingAdmin.id,
      }
    );

    if (rpcError) {
      console.error('Error executing atomic platform approval:', rpcError.message);
      return NextResponse.json({ error: 'Failed to save decision.' }, { status: 500 });
    }

    const resultCode = result?.code;
    const statusByCode: Record<string, number> = {
      not_found: 404,
      forbidden_target: 403,
      already_decided: 409,
      missing_company_name: 400,
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
      organization: result.organization || null,
      decision,
      decidedBy: actingAdmin.id,
      decidedAt: result.decided_at,
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error executing decision' },
      { status: 500 }
    );
  }
}
