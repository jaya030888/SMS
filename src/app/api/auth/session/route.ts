import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "../../../lib/auth-jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      studentId: payload.studentId,
    });
  } catch (error: any) {
    console.error("Session API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
