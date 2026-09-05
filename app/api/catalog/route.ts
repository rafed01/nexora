import { NextRequest, NextResponse } from "next/server";
import { getCatalog, saveCatalogItem } from "@/lib/db";

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
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid catalog item payload." },
        { status: 400 }
      );
    }

    const savedItem = await saveCatalogItem(body);

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
