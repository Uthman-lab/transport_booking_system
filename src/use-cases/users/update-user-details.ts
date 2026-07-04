import { err, ok, type Result } from "@/domain/shared/result";
import type { ManagedUser } from "@/domain/user/user.entity";
import {
  NotAuthorizedToManageError,
  UserDetailsUpdateError,
} from "@/domain/user/user.errors";
import type { UserRepository } from "@/domain/user/user.repository";
import { isPostgresError } from "./errors";

export type UpdateUserDetailsDeps = {
  userRepository: UserRepository;
};

export type UpdateUserDetailsInput = {
  targetUserId: string;
  fullName: string;
  studentId: string | null;
  phone: string | null;
};

export async function updateUserDetails(
  { userRepository }: UpdateUserDetailsDeps,
  input: UpdateUserDetailsInput,
): Promise<Result<ManagedUser, Error>> {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return err(new UserDetailsUpdateError());
  }

  const studentId = input.studentId?.trim() || null;
  const phone = input.phone?.trim() || null;

  try {
    return ok(
      await userRepository.updateDetails(input.targetUserId, {
        fullName,
        studentId,
        phone,
      }),
    );
  } catch (cause) {
    // RLS matched no row → target is an admin outside the caller's subtree.
    if (isPostgresError(cause, "PGRST116")) {
      return err(new NotAuthorizedToManageError({ cause }));
    }
    // A duplicate student_id trips the unique constraint (23505).
    return err(new UserDetailsUpdateError({ cause }));
  }
}
