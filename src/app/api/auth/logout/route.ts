import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear session_token cookie
    response.cookies.set("session_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
