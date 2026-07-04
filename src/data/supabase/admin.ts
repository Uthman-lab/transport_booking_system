import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client for privileged, SERVER-ONLY operations (inviting
// an admin by email). It BYPASSES RLS, so it must never reach the browser: the
// key is read from a non-NEXT_PUBLIC env var (undefined client-side) and this
// guard hard-fails if the module is ever evaluated in a browser bundle.
export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must only be used on the server.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Whether email invitations can be sent. The UI uses this to explain, rather
// than crash, when the service-role key hasn't been set.
export function isAdminClientConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
