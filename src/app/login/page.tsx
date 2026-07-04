import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  // Defense in depth alongside the proxy's inverse guard.
  if (user) redirect("/trips");

  const { redirectTo } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
