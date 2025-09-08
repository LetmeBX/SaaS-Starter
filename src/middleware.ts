import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth-only pages (should not be accessible when logged in)
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/sent");

  // Protected areas
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAppPage = pathname.startsWith("/app");

  // Check session via cookie (recommended by better-auth)
  const sessionCookie = getSessionCookie(request);
  const hasSession = !!sessionCookie;

  // If logged in and hitting auth pages, go to product workspace
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/app/invoices", request.url));
  }

  // If not logged in and trying to access protected areas, redirect to login with callback
  if (!hasSession && (isDashboardPage || isAppPage)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only on these paths for performance
  matcher: ["/dashboard/:path*", "/app/:path*", "/login", "/signup", "/auth/sent"],
};
