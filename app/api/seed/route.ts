import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/supabase/auth";

async function requireSeedAccess() {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_SEED !== 'true') {
    return { allowed: false, response: NextResponse.json({ error: 'Seed endpoint is disabled in production.' }, { status: 404 }) };
  }
  const adminAuth = await requirePlatformAdmin();
  if (!adminAuth.authorized) {
    return { allowed: false, response: NextResponse.json({ error: adminAuth.error }, { status: adminAuth.status }) };
  }
  return { allowed: true as const };
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireSeedAccess();
    if (!access.allowed) return access.response;
    const searchParams = request.nextUrl.searchParams;
    const force = searchParams.get("force") === "true" || searchParams.get("reset") === "true";

    const counts = await seedDatabase(force);

    return NextResponse.json({
      message: force
        ? "Database forcefully re-seeded to default demo state."
        : "Database initialization and seed verification complete.",
      status: "success",
      timestamp: new Date().toISOString(),
      counts,
    });
  } catch (error: any) {
    console.error("Error executing database seed:", error);
    return NextResponse.json(
      {
        error: "Failed to execute database seeding sequence.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireSeedAccess();
    if (!access.allowed) return access.response;
    let force = true;
    try {
      const body = await request.json();
      if (typeof body?.force === "boolean") {
        force = body.force;
      }
    } catch {
      // If no body provided on POST, default to force reset
      force = true;
    }

    const counts = await seedDatabase(force);

    return NextResponse.json(
      {
        message: "Database seed and reset successfully applied.",
        status: "success",
        timestamp: new Date().toISOString(),
        counts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error executing database seed via POST:", error);
    return NextResponse.json(
      {
        error: "Failed to execute database seeding sequence.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
