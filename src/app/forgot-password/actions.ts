"use server";

import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { requestPasswordReset } from "@/use-cases/auth/request-password-reset";

const forgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordInputSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const result = await requestPasswordReset(
    { authRepository: new SupabaseAuthRepository(supabase) },
    parsed.data.email,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  // Neutral message — never reveals whether the email is registered.
  return {
    status: "success",
    message: "If an account exists for that email, a reset link is on its way.",
  };
}
