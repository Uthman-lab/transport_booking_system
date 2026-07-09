export function SmtpNotice({ configured }: { configured: boolean }) {
  if (configured) return null;

  return (
    <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Email sending isn&apos;t configured — invite links must be copied and shared
      manually. Set <code>SMTP_HOST</code>, <code>SMTP_USER</code>, and{" "}
      <code>SMTP_PASS</code> on the server (see README).
    </p>
  );
}
