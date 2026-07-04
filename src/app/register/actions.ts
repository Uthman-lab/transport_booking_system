"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { register } from "@/use-cases/auth/register";

const registerInputSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  studentId: z.string().trim().min(1, "Student ID is required."),
  email: z.string().email(),
  // Matches supabase config.toml minimum_password_length = 6.
  password: z.string().min(6, "Password must be at least 6 characters."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type RegisterActionState = {
  status: "idle" | "error";
  message?: string;
};

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerInputSchema.safeParse({
    fullName: formData.get("fullName"),
    studentId: formData.get("studentId"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid registration details.",
    };
  }

  const supabase = await createClient();
  const result = await register(
    { authRepository: new SupabaseAuthRepository(supabase) },
    parsed.data,
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  // Confirmations are off, so the account is signed in immediately.
  redirect("/trips");
}
