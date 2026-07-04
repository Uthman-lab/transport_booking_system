import { WeakPasswordError } from "@/domain/auth/auth.errors";
import type { AuthRepository } from "@/domain/auth/auth.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type ResetPasswordDeps = {
  authRepository: AuthRepository;
};

// Sets a new password for the user in the active recovery session (reached via
// the /auth/confirm route). Thin wrapper: surfaces WeakPasswordError to the UI.
export async function resetPassword(
  { authRepository }: ResetPasswordDeps,
  newPassword: string,
): Promise<Result<void, WeakPasswordError>> {
  try {
    await authRepository.updatePassword(newPassword);
    return ok(undefined);
  } catch (error) {
    if (error instanceof WeakPasswordError) {
      return err(error);
    }
    throw error;
  }
}
