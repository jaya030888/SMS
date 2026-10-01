// src/app/api/admin/landing_cms/route.ts
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "../../../lib/auth-jwt";
import { erpStore } from "../../../lib/mockData";

export const runtime = "nodejs";

/**
 * GET: Fetch live Landing Page CMS content
 */
export async function GET() {
  try {
    const cmsData = erpStore.getLandingCMS();
    return NextResponse.json(cmsData, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/landing_cms error:", error);
    return NextResponse.json({ error: "Failed to fetch CMS content" }, { status: 500 });
  }
}

/**
 * PUT/POST: Update Landing Page CMS content (Admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Please login as administrator" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = erpStore.updateLandingCMS(body);
    return NextResponse.json({
      success: true,
      message: "Landing page content updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/landing_cms error:", error);
    return NextResponse.json({ error: "Failed to update CMS content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}

/**
 * DELETE: Reset Landing Page CMS content to defaults (Admin only)
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Please login as administrator" }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const resetData = erpStore.resetLandingCMS();
    return NextResponse.json({
      success: true,
      message: "Landing page content reset to defaults",
      data: resetData,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/landing_cms error:", error);
    return NextResponse.json({ error: "Failed to reset CMS content" }, { status: 500 });
  }
}
