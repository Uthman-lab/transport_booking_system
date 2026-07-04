import Image from "next/image";
import Link from "next/link";
import logoUbbs from "@/assets/logo_ubbs.jpg";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

// Server Component composition root: build the repository, call the use case,
// render session-aware navigation. No Supabase call escapes this boundary.
export async function SiteHeader() {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-background/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={logoUbbs}
            alt="UBBS crest"
            priority
            className="h-9 w-auto rounded"
          />
          <span className="text-lg font-semibold tracking-tight">UBBS</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/trips" className="font-medium text-muted transition-colors hover:text-foreground">
              Trips
            </Link>
            <Link href="/my-bookings" className="font-medium text-muted transition-colors hover:text-foreground">
              My bookings
            </Link>
            {isAdmin(user) ? (
              <Link href="/admin/trips" className="font-medium text-muted transition-colors hover:text-foreground">
                Admin
              </Link>
            ) : null}
            <span className="hidden text-muted sm:inline">{user.fullName}</span>
            <SignOutButton />
            <ThemeToggle />
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className={buttonClasses("primary", "sm")}>
              Sign in
            </Link>
            <ThemeToggle />
          </nav>
        )}
      </Container>
    </header>
  );
}
