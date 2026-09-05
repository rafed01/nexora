import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
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
