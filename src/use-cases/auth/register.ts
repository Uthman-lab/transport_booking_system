import type { AuthUser } from "@/domain/auth/auth-user.entity";
import {
  EmailAlreadyRegisteredError,
  StudentIdTakenError,
  WeakPasswordError,
} from "@/domain/auth/auth.errors";
import type { AuthRepository, SignUpInput } from "@/domain/auth/auth.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type RegisterDeps = {
  authRepository: AuthRepository;
};

export type RegisterError =
  | EmailAlreadyRegisteredError
  | StudentIdTakenError
  | WeakPasswordError;

export async function register(
  { authRepository }: RegisterDeps,
  input: SignUpInput,
): Promise<Result<AuthUser, RegisterError>> {
  try {
    const user = await authRepository.signUp(input);
    return ok(user);
  } catch (error) {
    // Expected, UI-facing failures come back as data; anything else is a
    // genuine bug/outage and is allowed to propagate.
    if (
      error instanceof EmailAlreadyRegisteredError ||
      error instanceof StudentIdTakenError ||
      error instanceof WeakPasswordError
    ) {
      return err(error);
    }
    throw error;
  }
}
