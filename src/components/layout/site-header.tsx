import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

// Server Component composition root: build the repository, call the use case,
// render session-aware navigation. No Supabase call escapes this boundary.
export async function SiteHeader() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/trips" className="text-lg font-semibold tracking-tight">
          UBBS
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/trips" className="font-medium hover:underline">
              Trips
            </Link>
            <span className="text-zinc-500">{user.fullName}</span>
            <SignOutButton />
          </nav>
        ) : (
          <nav className="text-sm">
            <Link href="/login" className="font-medium hover:underline">
              Sign in
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
