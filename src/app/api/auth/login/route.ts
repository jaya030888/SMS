import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";
import { signJWT } from "../../../lib/auth-jwt";

export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required." },
        { status: 400 }
      );
    }

    const normalizedUsername = String(username).trim();

    // Query credentials from users table
    const [rows]: any = await db.query(
      "SELECT id, username, password_hash, role, student_id FROM users WHERE username = ? AND role = ?",
      [normalizedUsername, role]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: role === "admin" ? "Invalid admin email or password" : "Student ID not found" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const passwordValid = verifyPassword(password, user.password_hash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: role === "admin" ? "Invalid admin email or password" : "Invalid Password" },
        { status: 401 }
      );
    }

    // Sign session token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      studentId: user.student_id,
    };

    const token = await signJWT(tokenPayload);

    // Set HttpOnly secure session cookie
    const response = NextResponse.json({
      success: true,
      role: user.role,
      studentId: user.student_id,
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
