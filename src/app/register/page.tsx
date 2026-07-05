import Link from "next/link";
import { redirect } from "next/navigation";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

// Self-registration is disabled — accounts are created by an administrator
// (invite or bulk upload). This page just explains that and points to sign-in.
export default async function RegisterPage() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  if (user) redirect("/trips");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Registration is by invitation</h1>
        <p className="mt-2 text-sm text-muted">
          Accounts for UBBS are created by an administrator. If you should have
          access, ask your admin to add you — you&apos;ll get an invite link to
          set your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
