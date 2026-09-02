import { NextResponse } from "next/server";
import { db } from "../../lib/db";

export const runtime = "nodejs";

// Render uses this route to verify that both the web server and PostgreSQL are ready.
export async function GET() {
  try {
    await db.query("SELECT 1");
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ status: "database_unavailable" }, { status: 503 });
  }
}
