// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";
import { signJWT } from "../../../lib/auth-jwt";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limiter";
import { sanitizeText, isValidRole } from "../../../lib/validate";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    
    // 1. Enforce Rate Limiting (max 10 login attempts per 5 minutes per IP)
    const rateLimit = checkRateLimit(`login:ip:${clientIp}`, 10, 300);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Username, password, and role are required." },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "Invalid account role specified." },
        { status: 400 }
      );
    }

    const normalizedUsername = sanitizeText(username).toLowerCase();

    // 2. Query credentials with parameterized query
    const [rows]: any = await db.query(
      "SELECT id, username, password_hash, role, student_id, teacher_id, name FROM users WHERE LOWER(username) = ? AND role = ?",
      [normalizedUsername, role]
    );

    // Generic error to prevent account enumeration
    const invalidCredsError = role === "admin" 
      ? "Invalid administrator email or password."
      : role === "teacher"
      ? "Invalid instructor email or password."
      : "Invalid student ID or password PIN.";

    if (rows.length === 0) {
      return NextResponse.json({ error: invalidCredsError }, { status: 401 });
    }

    const user = rows[0];
    const passwordValid = verifyPassword(String(password), user.password_hash);

    if (!passwordValid) {
      return NextResponse.json({ error: invalidCredsError }, { status: 401 });
    }

    // 3. Sign secure 24-hour JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      studentId: user.student_id,
      teacherId: user.teacher_id,
      name: user.name || (user.role === "admin" ? "Administrator" : "User"),
    };

    const token = await signJWT(tokenPayload, 86400);

    // 4. Return sanitized user metadata (NO password_hash or sensitive secrets)
    const response = NextResponse.json({
      success: true,
      role: user.role,
      studentId: user.student_id,
      teacherId: user.teacher_id,
      name: user.name,
    });

    // 5. Set secure HttpOnly cookie
    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error("Login Server Error:", error.message);
    return NextResponse.json(
      { error: "An unexpected server error occurred during authentication." },
      { status: 500 }
    );
  }
}
