"use server";

import { redirect } from "next/navigation";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { signOut } from "@/use-cases/auth/sign-out";

// Root Server Action used by the header's sign-out button. Clears the session,
// then bounces to /login (which the proxy also guards for unauthenticated users).
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await signOut({ authRepository: new SupabaseAuthRepository(supabase) });
  redirect("/login");
}
