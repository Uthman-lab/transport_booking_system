import type { AuthRepository } from "@/domain/auth/auth.repository";

export type SignOutDeps = {
  authRepository: AuthRepository;
};

export async function signOut({ authRepository }: SignOutDeps): Promise<void> {
  await authRepository.signOut();
}
