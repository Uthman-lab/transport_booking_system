import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

export default async function RegisterPage() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  if (user) redirect("/trips");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <RegisterForm />
    </main>
  );
}
