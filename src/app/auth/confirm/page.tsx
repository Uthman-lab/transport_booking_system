import Link from "next/link";
import { ConfirmForm } from "./confirm-form";

// Interstitial: instead of verifying the token on GET (which link-preview and
// email-scanner bots would trigger, burning the one-time token), we show a
// Continue button and verify only on the user's click. Bots don't click.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";

  const tokenHash = first(params.token_hash);
  const code = first(params.code);
  const type = first(params.type);
  const next = first(params.next) || "/trips";
  // Supabase appends these when its own /verify endpoint rejected the token.
  const errorDescription = first(params.error_description);

  const hasToken = Boolean(code || (tokenHash && type));
  const settingPassword = next.startsWith("/reset-password");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-xl border border-card-border bg-card p-6 text-center">
        {errorDescription ? (
          <>
            <h1 className="text-lg font-semibold">This link didn&apos;t work</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errorDescription}
            </p>
            <p className="mt-2 text-sm text-muted">
              Ask for a fresh link and open it again.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-md border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background"
            >
              Back to sign in
            </Link>
          </>
        ) : !hasToken ? (
          <>
            <h1 className="text-lg font-semibold">Invalid link</h1>
            <p className="mt-2 text-sm text-muted">
              This link is missing its verification token.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-md border border-card-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <ConfirmForm
            tokenHash={tokenHash}
            code={code}
            type={type}
            next={next}
            settingPassword={settingPassword}
          />
        )}
      </div>
    </main>
  );
}
