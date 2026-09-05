import { NextRequest, NextResponse } from "next/server";
import { saveAccessRequest, getAccessRequests } from "@/lib/db";

export async function GET() {
  try {
    const requests = await getAccessRequests();
    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Error retrieving access requests:", error);
    return NextResponse.json(
      { error: "Failed to retrieve access requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, organization, proposalBrief, tierRequested, roleRequested, sponsorNotes } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const payload = {
      name: name ? String(name).trim() : "",
      email: String(email).trim().toLowerCase(),
      organization: organization ? String(organization).trim() : "",
      proposalBrief: proposalBrief ? String(proposalBrief).trim() : "",
      tierRequested: tierRequested ? String(tierRequested).trim() : "researcher",
      roleRequested: roleRequested || "researcher",
      sponsorNotes: sponsorNotes ? String(sponsorNotes).trim() : "",
    };

    const savedRequest = await saveAccessRequest(payload);

    return NextResponse.json(
      {
        message: "Access request registered successfully.",
        data: savedRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving access request:", error);
    return NextResponse.json(
      { error: "Failed to process access request. Please try again later." },
      { status: 500 }
    );
  }
}
