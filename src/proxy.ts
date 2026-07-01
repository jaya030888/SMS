import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./app/lib/auth-jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect Admin Pages and API routes
  const isAdminRoute = pathname.startsWith("/pages/Admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isStudentRoute = pathname.startsWith("/pages/Student");

  // Auth pages where logged in users shouldn't go back to
  const isLoginPage = 
    pathname.startsWith("/pages/Login_Page") || 
    pathname.startsWith("/pages/Chose_Login");

  const sessionCookie = request.cookies.get("session_token")?.value;

  if (isAdminRoute || isAdminApi || isStudentRoute) {
    if (!sessionCookie) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/pages/Chose_Login", request.url));
    }

    const payload = await verifyJWT(sessionCookie);
    if (!payload) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Clear invalid token cookie
      const res = NextResponse.redirect(new URL("/pages/Chose_Login", request.url));
      res.cookies.delete("session_token");
      return res;
    }

    // Role checks
    if ((isAdminRoute || isAdminApi) && payload.role !== "admin") {
      if (isAdminApi) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/pages/Student/DashBoard", request.url));
    }

    if (isStudentRoute && payload.role !== "student") {
      return NextResponse.redirect(new URL("/pages/Admin/DashBoard", request.url));
    }
  }

  // Redirect authenticated users trying to access login screens
  if (isLoginPage && sessionCookie) {
    const payload = await verifyJWT(sessionCookie);
    if (payload) {
      if (payload.role === "admin") {
        return NextResponse.redirect(new URL("/pages/Admin/DashBoard", request.url));
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
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
