import type { UserRole } from "@/domain/auth/auth-user.entity";
import { err, ok, type Result } from "@/domain/shared/result";
import {
  AdminAlreadyExistsError,
  InviteFailedError,
} from "@/domain/user/user.errors";
import type {
  InvitedUser,
  InviteRepository,
} from "@/domain/user/invite.repository";

export type InviteUserDeps = {
  inviteRepository: InviteRepository;
};

export type InviteUserInput = {
  actingUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export async function inviteUser(
  { inviteRepository }: InviteUserDeps,
  input: InviteUserInput,
): Promise<Result<InvitedUser, Error>> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !fullName) {
    return err(new InviteFailedError());
  }

  try {
    return ok(
      await inviteRepository.inviteByEmail({
        email,
        fullName,
        role: input.role,
        invitedBy: input.actingUserId,
      }),
    );
  } catch (cause) {
    const code =
      typeof cause === "object" && cause !== null && "code" in cause
        ? (cause as { code?: unknown }).code
        : undefined;
    if (code === "email_exists" || code === "user_already_exists") {
      return err(new AdminAlreadyExistsError({ cause }));
    }
    return err(new InviteFailedError({ cause }));
  }
}
