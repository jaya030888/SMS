// src/app/lib/security.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "./auth-jwt";

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: "admin" | "teacher" | "student";
  studentId?: number;
  teacherId?: number;
  name?: string;
}

/**
 * Extract and verify authenticated user session from secure HttpOnly cookie
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload || !payload.role) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      studentId: payload.studentId,
      teacherId: payload.teacherId,
      name: payload.name,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Enforce authentication: returns user or standard 401 response
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser; error: null } | { user: null; error: NextResponse }
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

/**
 * Enforce Admin Role: returns user or 403 Forbidden response
 */
export async function requireAdmin(): Promise<
  { user: AuthenticatedUser; error: null } | { user: null; error: NextResponse }
> {
  const auth = await requireAuth();
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden. Administrative privileges required." },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Enforce Faculty/Teacher or Admin Role (for marks/attendance entry)
 */
export async function requireStaffOrAdmin(): Promise<
  { user: AuthenticatedUser; error: null } | { user: null; error: NextResponse }
> {
  const auth = await requireAuth();
  if (auth.error) return auth;

  if (auth.user.role !== "admin" && auth.user.role !== "teacher") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden. Instructor or Administrative access required." },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Enforce IDOR protection: Student can ONLY access their own resource,
 * whereas Admin or Instructor can access any authorized student resource.
 */
export function canAccessStudentData(
  user: AuthenticatedUser,
  targetStudentId: number | string
): boolean {
  if (user.role === "admin" || user.role === "teacher") {
    return true;
  }
  if (user.role === "student") {
    return String(user.studentId) === String(targetStudentId);
  }
  return false;
}
