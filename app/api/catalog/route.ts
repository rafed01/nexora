import { NextRequest, NextResponse } from "next/server";
import { getCatalog, saveCatalogItem } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/supabase/auth";

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

    const allowedTypes = ['technology', 'startup', 'expert', 'challenge', 'report'];
    const allowedStatuses = ['Active', 'Pending', 'Archived', 'Draft'];
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const type = typeof body.type === 'string' ? body.type : '';
    const trl = body.trl === undefined ? undefined : Number(body.trl);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !allowedTypes.includes(type) ||
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
