import { err, ok, type Result } from "@/domain/shared/result";
import {
  AdminAlreadyExistsError,
  InviteFailedError,
} from "@/domain/user/user.errors";
import type {
  InvitedAdmin,
  InviteRepository,
} from "@/domain/user/invite.repository";

export type InviteAdminDeps = {
  inviteRepository: InviteRepository;
};

export type InviteAdminInput = {
  actingUserId: string;
  email: string;
  fullName: string;
};

export async function inviteAdmin(
  { inviteRepository }: InviteAdminDeps,
  input: InviteAdminInput,
): Promise<Result<InvitedAdmin, Error>> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !fullName) {
    return err(new InviteFailedError());
  }

  try {
    return ok(
      await inviteRepository.inviteAdminByEmail({
        email,
        fullName,
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
