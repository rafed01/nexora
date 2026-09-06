import { NextRequest, NextResponse } from "next/server";
import { getCatalog, saveCatalogItem } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const catalogIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedTypes = ['technology', 'startup', 'expert', 'challenge', 'report'];
const allowedStatuses = ['Active', 'Pending', 'Archived', 'Draft'];

export async function GET() {
  try {
    const catalog = await getCatalog();
    return NextResponse.json({ catalog });
  } catch (error: any) {
    console.error("Error retrieving catalog items:", error);
    return NextResponse.json(
      { error: "Failed to retrieve catalog items." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminAuth = await requirePlatformAdmin();
    if (!adminAuth.authorized) {
      return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
    }
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid catalog item payload." },
        { status: 400 }
      );
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const type = typeof body.type === 'string' ? body.type : '';
    const trl = body.trl === undefined ? undefined : Number(body.trl);
    if (!catalogIdPattern.test(id) || !allowedTypes.includes(type) ||
        !title || title.length > 255 || (trl !== undefined && (!Number.isInteger(trl) || trl < 1 || trl > 9)) ||
        (body.status && !allowedStatuses.includes(body.status))) {
      return NextResponse.json({ error: 'Invalid catalog item fields.' }, { status: 400 });
    }

    const savedItem = await saveCatalogItem({ ...body, id, title, type, trl });

    return NextResponse.json(
      {
        message: "Catalog item saved successfully.",
        data: savedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving catalog item:", error);
    return NextResponse.json(
      { error: "Failed to save catalog item. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const adminAuth = await requirePlatformAdmin();
  if (!adminAuth.authorized) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
  try {
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id.trim() : '';
    if (!catalogIdPattern.test(id)) return NextResponse.json({ error: 'Invalid catalog identifier.' }, { status: 400 });
    const fields: Record<string, unknown> = {};
    const textFields = ['title', 'category', 'organization', 'description', 'status', 'publication_state'];
    for (const key of textFields) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== 'string' || body[key].trim().length > 5000) {
          return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
        }
        fields[key] = body[key].trim();
      }
    }
    if (fields.title !== undefined && !(fields.title as string)) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    if (fields.status !== undefined && !allowedStatuses.includes(fields.status as string)) return NextResponse.json({ error: 'Invalid catalog status.' }, { status: 400 });
    if (fields.publication_state !== undefined && !['draft', 'published', 'archived'].includes(fields.publication_state as string)) {
      return NextResponse.json({ error: 'Invalid publication state.' }, { status: 400 });
    }
    if (body.type !== undefined) {
      if (typeof body.type !== 'string' || !allowedTypes.includes(body.type)) return NextResponse.json({ error: 'Invalid catalog type.' }, { status: 400 });
      fields.type = body.type;
    }
    if (body.trl !== undefined) {
      const trl = Number(body.trl);
      if (!Number.isInteger(trl) || trl < 1 || trl > 9) return NextResponse.json({ error: 'Invalid TRL.' }, { status: 400 });
      fields.trl = trl;
    }
    if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'No editable fields provided.' }, { status: 400 });
    const { data, error } = await createAdminClient().from('catalog').update(fields).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Catalog item not found.' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating catalog item:', error);
    return NextResponse.json({ error: 'Failed to update catalog item.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminAuth = await requirePlatformAdmin();
  if (!adminAuth.authorized) return NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status });
  const id = new URL(request.url).searchParams.get('id')?.trim() || '';
  if (!catalogIdPattern.test(id)) return NextResponse.json({ error: 'Invalid catalog identifier.' }, { status: 400 });
  try {
    const db = createAdminClient();
    const { data: existing, error: findError } = await db.from('catalog').select('id').eq('id', id).maybeSingle();
    if (findError) throw findError;
    if (!existing) return NextResponse.json({ error: 'Catalog item not found.' }, { status: 404 });
    const [{ count: bookmarkCount, error: bookmarkError }, { count: requestCount, error: requestError }] = await Promise.all([
      db.from('bookmarks').select('*', { count: 'exact', head: true }).eq('catalog_id', id),
      db.from('requests').select('*', { count: 'exact', head: true }).eq('catalog_id', id),
    ]);
    if (bookmarkError || requestError) throw bookmarkError || requestError;
    if ((bookmarkCount || 0) > 0 || (requestCount || 0) > 0) {
      const { data, error } = await db.from('catalog').update({ status: 'Archived', publication_state: 'archived' }).eq('id', id).select().single();
      if (error) throw error;
      return NextResponse.json({ data, archived: true });
    }
    const { error } = await db.from('catalog').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting catalog item:', error);
    return NextResponse.json({ error: 'Failed to delete catalog item.' }, { status: 500 });
  }
}
