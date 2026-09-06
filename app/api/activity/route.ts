import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedUser } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const actions = new Set(['view', 'bookmark', 'scout_query', 'request_access', 'download_report', 'proposal_submit']);
const entityTypes = new Set(['technology', 'startup', 'expert', 'challenge', 'report']);

export async function GET() {
  const auth = await requireApprovedUser();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await createAdminClient().from('user_activity')
    .select('id, action, entity_type, entity_id, metadata, created_at')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('Error loading activity:', error.message);
    return NextResponse.json({ error: 'Failed to load activity.' }, { status: 500 });
  }
  return NextResponse.json({ activity: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireApprovedUser();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json();
    const action = typeof body?.action === 'string' ? body.action : '';
    const entityType = typeof body?.entityType === 'string' ? body.entityType : null;
    const entityId = typeof body?.entityId === 'string' ? body.entityId.trim().slice(0, 255) : null;
    const metadata = body?.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {};
    if (!actions.has(action) || (entityType && !entityTypes.has(entityType))) {
      return NextResponse.json({ error: 'Invalid activity payload.' }, { status: 400 });
    }
    const { data, error } = await createAdminClient().from('user_activity').insert({
      user_id: auth.user.id, action, entity_type: entityType, entity_id: entityId, metadata,
    }).select('id, action, entity_type, entity_id, metadata, created_at').single();
    if (error) throw error;
    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) {
    console.error('Error recording activity:', error);
    return NextResponse.json({ error: 'Failed to record activity.' }, { status: 500 });
  }
}
