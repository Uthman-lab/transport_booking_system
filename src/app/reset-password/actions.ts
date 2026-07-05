"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { resetPassword } from "@/use-cases/auth/reset-password";

const resetPasswordInputSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordActionState = {
  status: "idle" | "error";
  message?: string;
};

// Reached via /auth/confirm with an active recovery session. Sets the new
// password on the current user, then drops them into the app signed in.
export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordInputSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid password.",
    };
  }

  const supabase = await createClient();

  let result;
  try {
    result = await resetPassword(
      { authRepository: new SupabaseAuthRepository(supabase) },
      parsed.data.password,
    );
  } catch (cause) {
    // Anything other than a weak-password error (e.g. reused password, or an
    // expired/missing recovery session) reaches here. Surface it instead of
    // letting it bubble up as an opaque 500, and log the real reason.
    console.error("reset-password: could not update password", cause);
    const detail = cause instanceof Error ? cause.message : "";
    return {
      status: "error",
      message: detail
        ? `Couldn't reset your password: ${detail}`
        : "Couldn't reset your password. Your reset link may have expired — request a new one.",
    };
  }

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  // Outside the try/catch: redirect() throws NEXT_REDIRECT by design and must
  // not be swallowed.
  redirect("/trips");
}
