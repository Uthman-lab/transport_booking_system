import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/data/supabase/server";

// Lands email links (confirm signup, password recovery, invite) and OAuth/PKCE
// redirects, establishes the session, then forwards to `next`. Handles BOTH
// Supabase flows so it works regardless of email-template style:
//   • PKCE / default templates → arrive with `?code=` → exchangeCodeForSession
//   • token_hash templates      → arrive with `?token_hash=&type=` → verifyOtp
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/trips";

  // Only permit relative destinations to avoid open-redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/trips";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Could+not+verify+link", request.url),
  );
}
