import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ADMIN_API_ROUTES = ["/api/stories", "/api/categories", "/api/tags", "/api/upload", "/api/import"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin pages and API routes
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = ADMIN_API_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow login/auth routes without auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow the login page itself
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Allow GET on public API (stories list, search, categories for public)
  if (pathname === "/api/stories" && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/categories") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/tags") && req.method === "GET") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/search")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = req.cookies.get("kidsite_admin_token")?.value;

  if (!token) {
    // API: return 401
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages: redirect to login
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/stories/:path*", "/api/categories/:path*", "/api/tags/:path*", "/api/upload/:path*", "/api/import/:path*"],
};
