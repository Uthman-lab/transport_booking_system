import type { ManagedUser } from "@/domain/user/user.entity";
import type { UserRepository } from "@/domain/user/user.repository";

export type ListUsersDeps = {
  userRepository: UserRepository;
};

export async function listUsers({
  userRepository,
}: ListUsersDeps): Promise<ManagedUser[]> {
  return userRepository.listAll();
}
