import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Reached via the /auth/confirm route with an active recovery session. The
// proxy lists /reset-password as public so the (recovery-authenticated) user
// isn't bounced by the inverse guard.
export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <ResetPasswordForm />
    </main>
  );
}
