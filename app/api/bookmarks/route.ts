import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedUser } from '@/lib/supabase/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const catalogIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET() {
  const auth = await requireApprovedUser();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await createAdminClient()
    .from('bookmarks')
    .select('id, catalog_id, folder, notes, created_at, catalog:catalog_id(id, title, type, category, trl, organization)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error loading bookmarks:', error.message);
    return NextResponse.json({ error: 'Failed to load bookmarks.' }, { status: 500 });
  }
  return NextResponse.json({ bookmarks: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireApprovedUser();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const catalogId = typeof body?.catalogId === 'string' ? body.catalogId.trim() : '';
    const folder = typeof body?.folder === 'string' ? body.folder.trim().slice(0, 100) : 'default';
    const notes = typeof body?.notes === 'string' ? body.notes.trim().slice(0, 2000) : null;
    if (!catalogIdPattern.test(catalogId)) {
      return NextResponse.json({ error: 'Invalid catalog identifier.' }, { status: 400 });
    }

    const db = createAdminClient();
    const { data: catalog, error: catalogError } = await db.from('catalog').select('id').eq('id', catalogId).maybeSingle();
    if (catalogError) throw catalogError;
    if (!catalog) return NextResponse.json({ error: 'Catalog item not found.' }, { status: 404 });

    const { data, error } = await db.from('bookmarks')
      .upsert({ user_id: auth.user.id, catalog_id: catalogId, folder: folder || 'default', notes }, { onConflict: 'user_id,catalog_id' })
      .select('id, catalog_id, folder, notes, created_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ bookmark: data }, { status: 201 });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return NextResponse.json({ error: 'Failed to save bookmark.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApprovedUser();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const catalogId = new URL(request.url).searchParams.get('catalogId')?.trim() || '';
  if (!catalogIdPattern.test(catalogId)) {
    return NextResponse.json({ error: 'Invalid catalog identifier.' }, { status: 400 });
  }

  const { error } = await createAdminClient().from('bookmarks')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('catalog_id', catalogId);
  if (error) {
    console.error('Error removing bookmark:', error.message);
    return NextResponse.json({ error: 'Failed to remove bookmark.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
