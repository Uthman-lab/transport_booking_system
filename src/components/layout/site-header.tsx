import Image from "next/image";
import Link from "next/link";
import logoUbbs from "@/assets/logo_ubbs.jpg";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
    <header className="border-b border-card-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/trips" className="flex items-center gap-2.5">
          <Image
            src={logoUbbs}
            alt="UBBS crest"
            priority
            className="h-9 w-auto"
          />
          <span className="text-lg font-semibold tracking-tight">UBBS</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/trips" className="font-medium hover:underline">
              Trips
            </Link>
            <Link href="/my-bookings" className="font-medium hover:underline">
              My bookings
            </Link>
            <span className="text-muted">{user.fullName}</span>
            <SignOutButton />
            <ThemeToggle />
          </nav>
        ) : (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="font-medium hover:underline">
              Sign in
            </Link>
            <ThemeToggle />
          </nav>
        )}
      </div>
    </header>
  );
}
