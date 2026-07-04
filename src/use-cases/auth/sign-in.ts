import type { AuthUser } from "@/domain/auth/auth-user.entity";
import {
  EmailNotConfirmedError,
  InvalidCredentialsError,
} from "@/domain/auth/auth.errors";
import type { AuthRepository, SignInInput } from "@/domain/auth/auth.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type SignInDeps = {
  authRepository: AuthRepository;
};

export type SignInError = InvalidCredentialsError | EmailNotConfirmedError;

export async function signIn(
  { authRepository }: SignInDeps,
  input: SignInInput,
): Promise<Result<AuthUser, SignInError>> {
  try {
    const user = await authRepository.signInWithPassword(input);
    return ok(user);
  } catch (error) {
    if (
      error instanceof InvalidCredentialsError ||
      error instanceof EmailNotConfirmedError
    ) {
      return err(error);
    }
    throw error;
  }
}
