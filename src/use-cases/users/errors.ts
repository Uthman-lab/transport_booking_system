// Structural check for a Postgres/PostgREST error code without importing
// @supabase/* into the use-cases layer. Supabase surfaces errors as objects
// with a string `code` (e.g. "PGRST116" for no-rows, "42501" for a raised
// insufficient-privilege exception from an RPC).
export function isPostgresError(cause: unknown, code: string): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as { code?: unknown }).code === code
  );
}
