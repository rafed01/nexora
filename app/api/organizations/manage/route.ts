import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireEnterpriseApprover } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Enterprise Organization Management API
 * Protected endpoint: only accessible by Platform Admins or authorized Enterprise Approvers for their organization.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    // Authorize via server helper
    const authOutcome = await requireEnterpriseApprover(orgId);
    if (!authOutcome.authorized) {
      return NextResponse.json(
        { error: authOutcome.error },
        { status: authOutcome.status }
      );
    }

    const adminDb = createAdminClient();
    const targetOrgId = orgId || authOutcome.user.organization_id;

    if (!targetOrgId) {
      return NextResponse.json(
        { error: 'No target organization specified' },
        { status: 400 }
      );
    }

    // Fetch organization record
    const { data: org, error: orgError } = await adminDb
      .from('organizations')
      .select('*')
      .eq('id', targetOrgId)
      .maybeSingle();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Fetch members of this organization
    const { data: members, error: membersError } = await adminDb
      .from('organization_members')
      .select('id, user_id, role, created_at')
      .eq('organization_id', targetOrgId);

    // Fetch employees linked to this organization in profiles
    const { data: employees, error: empError } = await adminDb
      .from('profiles')
      .select('id, email, full_name, role, approval_status, created_at')
      .eq('organization_id', targetOrgId);

    return NextResponse.json({
      organization: org,
      members: members || [],
      employees: employees || [],
    });
  } catch (error: any) {
    console.error('Error in enterprise organization management route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, action, targetUserId, memberRole } = body;

    const authOutcome = await requireEnterpriseApprover(orgId);
    if (!authOutcome.authorized) {
      return NextResponse.json(
        { error: authOutcome.error },
        { status: authOutcome.status }
      );
    }

    const adminDb = createAdminClient();

    if (action === 'approve_employee' && targetUserId) {
      // Approve employee affiliation
      const { error: updateError } = await adminDb
        .from('profiles')
        .update({
          approval_status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)
        .eq('organization_id', orgId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Employee clearance approved for organization.',
      });
    }

    if (action === 'update_member_role' && targetUserId && memberRole) {
      const { error: roleError } = await adminDb
        .from('organization_members')
        .upsert(
          {
            organization_id: orgId,
            user_id: targetUserId,
            role: memberRole,
          },
          { onConflict: 'organization_id,user_id' }
        );

      if (roleError) {
        return NextResponse.json(
          { error: roleError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Organization member role updated.',
      });
    }

    return NextResponse.json(
      { error: 'Unsupported enterprise action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling enterprise POST action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
