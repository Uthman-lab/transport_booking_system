"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/data/supabase/server";

function friendlyConfirmError(message: string): string {
  if (message.includes("PKCE code verifier not found")) {
    return "Open the reset link in the same browser you requested it from, or request a new link.";
  }
  return message;
}

// Verifies the email link's token ONLY when the user submits the confirm form
// (a real click). Preview/scanner bots that merely GET /auth/confirm never
// reach this, so they can't consume the one-time token. Handles both the
// token_hash (verifyOtp) and PKCE (?code=) flows.
export async function confirmAction(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const code = String(formData.get("code") ?? "");
  const type = String(formData.get("type") ?? "") as EmailOtpType | "";
  const nextRaw = String(formData.get("next") ?? "/trips");
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/trips";

  const supabase = await createClient();

  let reason = "Could not verify link";
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(safeNext);
    reason = error.message;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(safeNext);
    reason = error.message;
  }

  // redirect() throws NEXT_REDIRECT, so a successful verify above never reaches
  // here; only genuine failures do.
  redirect(`/login?error=${encodeURIComponent(friendlyConfirmError(reason))}`);
}
