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
  const result = await resetPassword(
    { authRepository: new SupabaseAuthRepository(supabase) },
    parsed.data.password,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  redirect("/trips");
}
