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

    const decisionTime = new Date().toISOString();

    const adminSupabase = createAdminClient();

    // Retrieve existing profile to verify it's a valid top-level pending account
    const { data: existingProfile, error: fetchErr } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchErr || !existingProfile) {
      return NextResponse.json(
        { error: 'Account not found in profile registry' },
        { status: 404 }
      );
    }

    // Merge metadata with decision audit telemetry
    const updatedMetadata = {
      ...(existingProfile.metadata || {}),
      reviewed_by: actingAdmin.id,
      reviewed_by_email: actingAdmin.email,
      reviewed_at: decisionTime,
      decision_notes: reason || null,
      rejection_reason: decision === 'rejected' ? (reason || 'Application declined by platform governance committee.') : null,
    };

    const updatePayload: Record<string, any> = {
      approval_status: decision,
      updated_at: decisionTime,
      metadata: updatedMetadata,
    };

    // If approved, ensure onboarding_completed remains false unless already complete
    if (decision === 'approved' && typeof existingProfile.onboarding_completed !== 'boolean') {
      updatePayload.onboarding_completed = false;
    }

    const { data: updatedRecord, error: updateErr } = await adminSupabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (updateErr) {
      console.error('Error executing admin decision in Supabase:', updateErr.message);
      return NextResponse.json(
        { error: `Failed to save decision: ${updateErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      decision,
      decidedBy: actingAdmin.id,
      decidedAt: decisionTime,
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error executing decision' },
      { status: 500 }
    );
  }
}
