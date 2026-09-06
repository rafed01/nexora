import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const decisions = new Set(['approved', 'rejected']);

export async function GET() {
  const auth = await requirePlatformAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await createAdminClient()
    .from('requests')
    .select('id, name, email, organization, proposal_brief, request_type, status, catalog_id, created_at, decided_at, catalog:catalog_id(title, type)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('Error loading admin requests:', error.message);
    return NextResponse.json({ error: 'Failed to load requests.' }, { status: 500 });
  }
  return NextResponse.json({ requests: data || [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePlatformAdmin();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    const decision = typeof body?.decision === 'string' ? body.decision : '';
    if (!id || !decisions.has(decision)) {
      return NextResponse.json({ error: 'A request ID and valid decision are required.' }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from('requests')
      .update({ status: decision, decided_by: auth.user.id, decided_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id, status, decided_at')
      .maybeSingle();
    if (error) throw error;
    if (data) return NextResponse.json({ request: data });

    const { data: existing, error: existingError } = await db.from('requests').select('id, status').eq('id', id).maybeSingle();
    if (existingError) throw existingError;
    if (!existing) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    return NextResponse.json({ error: 'This request has already been decided.' }, { status: 409 });
  } catch (error) {
    console.error('Error deciding admin request:', error);
    return NextResponse.json({ error: 'Failed to decide request.' }, { status: 500 });
  }
}
