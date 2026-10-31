import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "./lib/roles";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

const ADMIN_ONLY_ROUTES = ["/staff"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Ignore static assets and api routes that handle their own auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. Unauthenticated users
  if (!user) {
    if (!isPublicRoute && pathname !== "/") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // 2. Fetch role for authenticated users
  let role: UserRole = "customer";
  const appRole = user.app_metadata?.role as UserRole | undefined;

  if (appRole) {
    role = appRole;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      role = profile.role as UserRole;
    }
  }

  const isTeamUser = role === "admin" || role === "staff";
  const isCustomer = role === "customer";
  const isPortalRoute = pathname === "/portal" || pathname.startsWith("/portal/");

  // 3. Authenticated user visiting public auth pages -> redirect to home/dashboard
  if (isPublicRoute || pathname === "/") {
    const target = isTeamUser ? "/dashboard" : "/portal";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 4. Role restrictions
  if (isCustomer && !isPortalRoute) {
    // Customers can only access portal
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (isTeamUser && isPortalRoute) {
    // Team users redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (role === "staff" && ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    // Staff cannot access admin-only routes -> 403
    return new NextResponse("Access forbidden: Admin role required.", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

