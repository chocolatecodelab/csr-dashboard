import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: "nodejs",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Public routes (accessible without authentication)
  const isPublicRoute = pathname.startsWith("/auth");
  
  // If user is on public route (login/register)
  if (isPublicRoute) {
    // If already authenticated, redirect to dashboard
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    // Allow access to login/register pages
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Token invalid, redirect to login
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // Token valid, allow access to protected routes
  return NextResponse.next();
}

// Protect all routes except:
// - API auth routes
// - Static files (_next/static, _next/image)
// - Public assets (favicon, images)
// - Auth pages (login, register)
