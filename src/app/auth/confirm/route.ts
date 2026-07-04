import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/data/supabase/server";

// Verifies the token_hash from an email link (email confirmation or password
// recovery) and, on success, forwards to `next`. Standard Supabase SSR pattern:
// the email template's {{ .ConfirmationURL }} points here with token_hash+type.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/trips";

  // Only permit relative destinations to avoid open-redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/trips";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Could+not+verify+link", request.url),
  );
}
