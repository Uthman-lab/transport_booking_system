"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { signIn } from "@/use-cases/auth/sign-in";

const signInInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

export type SignInActionState = {
  status: "idle" | "error";
  message?: string;
};

// Only allow relative, single-slash paths so a crafted ?redirectTo= can't send
// the user to an external origin after login.
function safeRedirect(target?: string): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/trips";
}

// Composition root for sign-in: validate untrusted FormData, wire the concrete
// repository into the use case, translate its Result into UI state. On success
// redirect() throws NEXT_REDIRECT and never returns.
export async function signInAction(
  _prevState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const parsed = signInInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please enter a valid email and password." };
  }

  const supabase = await createClient();
  const result = await signIn(
    { authRepository: new SupabaseAuthRepository(supabase) },
    { email: parsed.data.email, password: parsed.data.password },
  );

  if (!result.ok) {
    return { status: "error", message: result.error.message };
  }

  redirect(safeRedirect(parsed.data.redirectTo));
}
