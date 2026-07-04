import type { UserRole } from "@/domain/auth/auth-user.entity";
import { err, ok, type Result } from "@/domain/shared/result";
import { canAdminChangeRole, type ManagedUser } from "@/domain/user/user.entity";
import {
  CannotChangeOwnRoleError,
  UserRoleUpdateError,
} from "@/domain/user/user.errors";
import type { UserRepository } from "@/domain/user/user.repository";

export type ChangeUserRoleDeps = {
  userRepository: UserRepository;
};

export type ChangeUserRoleInput = {
  actingUserId: string;
  targetUserId: string;
  newRole: UserRole;
};

export async function changeUserRole(
  { userRepository }: ChangeUserRoleDeps,
  input: ChangeUserRoleInput,
): Promise<Result<ManagedUser, Error>> {
  if (!canAdminChangeRole(input.actingUserId, input.targetUserId)) {
    return err(new CannotChangeOwnRoleError());
  }

  try {
    return ok(await userRepository.updateRole(input.targetUserId, input.newRole));
  } catch (cause) {
    return err(new UserRoleUpdateError({ cause }));
  }
}
