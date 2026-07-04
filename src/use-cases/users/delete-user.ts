import { err, ok, type Result } from "@/domain/shared/result";
import { canDeleteUser } from "@/domain/user/user.entity";
import {
  CannotDeleteSelfError,
  NotAuthorizedToManageError,
  UserDeleteError,
} from "@/domain/user/user.errors";
import type { UserRepository } from "@/domain/user/user.repository";
import { isPostgresError } from "./errors";

export type DeleteUserDeps = {
  userRepository: UserRepository;
};

export type DeleteUserInput = {
  actingUserId: string;
  targetUserId: string;
};

export async function deleteUser(
  { userRepository }: DeleteUserDeps,
  input: DeleteUserInput,
): Promise<Result<void, Error>> {
  if (!canDeleteUser(input.actingUserId, input.targetUserId)) {
    return err(new CannotDeleteSelfError());
  }

  try {
    await userRepository.delete(input.targetUserId);
    return ok(undefined);
  } catch (cause) {
    // delete_user raises errcode 42501 when the target is off-limits (an admin
    // outside the caller's invite subtree, or self).
    if (isPostgresError(cause, "42501")) {
      return err(new NotAuthorizedToManageError({ cause }));
    }
    return err(new UserDeleteError({ cause }));
  }
}
