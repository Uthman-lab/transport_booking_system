import { EmailRateLimitError } from "@/domain/auth/auth.errors";
import type { AuthRepository } from "@/domain/auth/auth.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type RequestPasswordResetDeps = {
  authRepository: AuthRepository;
};

// Thin wrapper over the repo. Never reveals whether the email exists — success
// is returned regardless so the UI can show a neutral "check your inbox" note.
export async function requestPasswordReset(
  { authRepository }: RequestPasswordResetDeps,
  email: string,
): Promise<Result<void, Error>> {
  try {
    await authRepository.requestPasswordReset(email);
    return ok(undefined);
  } catch (cause) {
    // Rate limiting isn't account-specific, so surfacing it is safe and helps
    // the user understand they should wait rather than retry immediately.
    if (cause instanceof EmailRateLimitError) {
      return err(cause);
    }
    return err(new Error("Could not send the reset link. Try again.", { cause }));
  }
}
