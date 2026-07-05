import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { Container } from "@/components/ui/container";
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
    <main className="flex-1 py-10">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Admin console</h1>
            <p className="mt-1 text-muted">
              Track performance and manage trips, routes, and users.
            </p>
          </div>
          <AdminNav />
        </div>
        <div className="mt-8">{children}</div>
      </Container>
    </main>
  );
}
