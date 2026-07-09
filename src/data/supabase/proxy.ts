import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
];

// Signed-in users have no reason to see these; bounce them into the app.
const AUTH_ONLY_PATHS = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Supabase may fall back to site_url (root) when redirectTo isn't allow-listed,
  // leaving a PKCE ?code= on /. Forward it to /auth/confirm so the user can
  // finish password reset (or other recovery flows) instead of dead-ending.
  const code = request.nextUrl.searchParams.get("code");
  if (code && !pathname.startsWith("/auth/confirm")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    url.search = "";
    url.searchParams.set("code", code);
    url.searchParams.set("next", "/reset-password");
    return NextResponse.redirect(url);
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (tokenHash && type && !pathname.startsWith("/auth/confirm")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    url.search = "";
    url.searchParams.set("token_hash", tokenHash);
    url.searchParams.set("type", type);
    const next = request.nextUrl.searchParams.get("next");
    url.searchParams.set(
      "next",
      type === "recovery" ? "/reset-password" : (next ?? "/trips"),
    );
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // "/" is the public landing page — matched exactly so it doesn't turn every
  // route public the way a `startsWith("/")` prefix would.
  const isPublicPath =
    pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Remember where they were headed so login can send them back.
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Admin area: signed-in non-admins are bounced to the app. RLS is the hard
  // backstop; this keeps them from even reaching the admin UI. The staff area
  // is open to staff and admins. Both checks share one profile read.
  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role;

    const allowed = pathname.startsWith("/admin")
      ? role === "admin"
      : role === "admin" || role === "staff";

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/trips";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (user && AUTH_ONLY_PATHS.some((path) => pathname === path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/trips";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
