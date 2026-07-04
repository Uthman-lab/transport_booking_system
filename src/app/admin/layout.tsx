import Link from "next/link";
import { redirect } from "next/navigation";
import { SupabaseAuthRepository } from "@/data/repositories/supabase-auth.repository";
import { createClient } from "@/data/supabase/server";
import { isAdmin } from "@/domain/auth/auth-user.entity";
import { getCurrentUser } from "@/use-cases/auth/get-current-user";

// The proxy already redirects non-admins away from /admin; this is a defensive
// second layer (and gives a clean redirect if the proxy is ever bypassed).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser({
    authRepository: new SupabaseAuthRepository(supabase),
  });

  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/trips");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/trips" className="font-medium hover:underline">
            Trips
          </Link>
          <Link href="/admin/routes" className="font-medium hover:underline">
            Routes
          </Link>
          <Link href="/admin/users" className="font-medium hover:underline">
            Users
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
