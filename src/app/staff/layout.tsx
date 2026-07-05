import Link from "next/link";
import { redirect } from "next/navigation";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { isStaff } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

// The proxy already bounces non-staff away from /staff; this is a defensive
// second layer (and a clean redirect if the proxy is ever bypassed). Admins are
// a superset of staff, so isStaff() lets them in too.
export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  if (!user) redirect("/login");
  if (!isStaff(user)) redirect("/trips");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <h1 className="text-2xl font-semibold">Staff</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/staff/check-in" className="font-medium hover:underline">
            Check-in
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
