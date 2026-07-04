import type { AuthUser } from "@/domain/auth/auth-user.entity";
import type { AuthRepository } from "@/domain/auth/auth.repository";

export type GetCurrentUserDeps = {
  authRepository: AuthRepository;
};

export async function getCurrentUser({
  authRepository,
}: GetCurrentUserDeps): Promise<AuthUser | null> {
  return authRepository.getCurrentUser();
}
