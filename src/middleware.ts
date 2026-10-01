// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./app/lib/auth-jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Route classifications
  const isAdminRoute = pathname.startsWith("/pages/Admin");
  const isTeacherRoute = pathname.startsWith("/pages/Teacher");
  const isStudentRoute = pathname.startsWith("/pages/Student");
  const isAdminApi = pathname.startsWith("/api/admin");

  const isLoginPage = 
    pathname.startsWith("/pages/Login_Page") || 
    pathname.startsWith("/pages/Chose_Login");

  const sessionCookie = request.cookies.get("session_token")?.value;

  // 1. Enforce RBAC on Protected Role Portals
  if (isAdminRoute || isTeacherRoute || isStudentRoute || isAdminApi) {
    if (!sessionCookie) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/pages/Chose_Login", request.url));
    }

    const payload = await verifyJWT(sessionCookie);
    if (!payload || !payload.role) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Invalid or expired session token." }, { status: 401 });
      }
      const res = NextResponse.redirect(new URL("/pages/Chose_Login", request.url));
      res.cookies.delete("session_token");
      return res;
    }

    // Admin role enforcement
    if (isAdminRoute || isAdminApi) {
      if (payload.role !== "admin") {
        if (isAdminApi) {
          return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
        }
        return NextResponse.redirect(
          new URL(payload.role === "teacher" ? "/pages/Teacher/DashBoard" : "/pages/Student/DashBoard", request.url)
        );
      }
    }

    // Teacher role enforcement
    if (isTeacherRoute) {
      if (payload.role !== "teacher" && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/pages/Student/DashBoard", request.url));
      }
    }

    // Student role enforcement
    if (isStudentRoute) {
      if (payload.role !== "student" && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/pages/Teacher/DashBoard", request.url));
      }
    }
  }

  // 2. Redirect already-authenticated users away from login pages
  if (isLoginPage && sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload && payload.role) {
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/pages/Admin/DashBoard", request.url));
      } else if (payload.role === "teacher") {
        return NextResponse.redirect(new URL("/pages/Teacher/DashBoard", request.url));
      } else if (payload.role === "student") {
        return NextResponse.redirect(new URL("/pages/Student/DashBoard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
