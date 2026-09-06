import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireApprovedUser } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const requestTypes = new Set(['access_briefing', 'nda', 'collaboration_proposal', 'due_diligence', 'report_download']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireApprovedUser();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await createAdminClient().from('requests')
    .select('id, request_type, status, catalog_id, organization, proposal_brief, created_at, updated_at')
    .or(`requester_id.eq.${auth.user.id},user_id.eq.${auth.user.id}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error loading requests:', error.message);
    return NextResponse.json({ error: 'Failed to load requests.' }, { status: 500 });
  }
  return NextResponse.json({ requests: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestType = typeof body?.requestType === 'string' ? body.requestType : 'access_briefing';
    const isPublicAccessRequest = requestType === 'access_briefing';
    const currentUser = await getCurrentUser();
    if (!currentUser && !isPublicAccessRequest) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }
    if (currentUser && currentUser.role !== 'admin' && currentUser.approval_status !== 'approved') {
      return NextResponse.json({ error: 'Account approval is required.' }, { status: 403 });
    }
    if (!requestTypes.has(requestType)) {
      return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
    }
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : currentUser?.email || '';
    const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 255) : currentUser?.full_name || '';
    const organization = typeof body?.organization === 'string' ? body.organization.trim().slice(0, 255) : '';
    const proposalBrief = typeof body?.proposalBrief === 'string' ? body.proposalBrief.trim().slice(0, 5000) : '';
    const catalogId = typeof body?.catalogId === 'string' ? body.catalogId.trim() : null;
    if (!emailPattern.test(email) || !name || !proposalBrief) {
      return NextResponse.json({ error: 'Name, valid email, and request details are required.' }, { status: 400 });
    }
    const { data, error } = await createAdminClient().from('requests').insert({
      id: crypto.randomUUID(),
      requester_id: currentUser?.id || null,
      user_id: currentUser?.id || null,
      email, name, organization: organization || null, proposal_brief: proposalBrief,
      catalog_id: catalogId, request_type: requestType, status: 'pending',
      payload: { source: typeof body?.source === 'string' ? body.source.slice(0, 100) : 'web' },
    }).select('id, request_type, status, created_at').single();
    if (error) throw error;
    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 });
  }
}
