import type { UserRole } from "@/domain/auth/auth-user.entity";
import { err, ok, type Result } from "@/domain/shared/result";
import { canAdminChangeRole, type ManagedUser } from "@/domain/user/user.entity";
import {
  CannotChangeOwnRoleError,
  NotAuthorizedToManageError,
  UserRoleUpdateError,
} from "@/domain/user/user.errors";
import type { UserRepository } from "@/domain/user/user.repository";
import { isPostgresError } from "./errors";

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

  // Promoting a user to admin records the acting admin as their inviter, which
  // is what places the new admin in the promoter's manage-able subtree.
  const invitedBy = input.newRole === "admin" ? input.actingUserId : undefined;

  try {
    return ok(
      await userRepository.updateRole(input.targetUserId, {
        role: input.newRole,
        invitedBy,
      }),
    );
  } catch (cause) {
    // The RLS UPDATE matched no row: the target is an admin outside the caller's
    // invite subtree.
    if (isPostgresError(cause, "PGRST116")) {
      return err(new NotAuthorizedToManageError({ cause }));
    }
    return err(new UserRoleUpdateError({ cause }));
  }
}
