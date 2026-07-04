import { err, ok, type Result } from "@/domain/shared/result";
import type {
  InviteRepository,
  ResendResult,
} from "@/domain/user/invite.repository";
import {
  InviteAlreadyAcceptedError,
  InviteFailedError,
} from "@/domain/user/user.errors";
import { isPostgresError } from "./errors";

export type ResendInviteDeps = {
  inviteRepository: InviteRepository;
};

export async function resendInvite(
  { inviteRepository }: ResendInviteDeps,
  userId: string,
): Promise<Result<ResendResult, Error>> {
  try {
    return ok(await inviteRepository.resendInvite(userId));
  } catch (cause) {
    if (isPostgresError(cause, "invite_already_accepted")) {
      return err(new InviteAlreadyAcceptedError({ cause }));
    }
    return err(new InviteFailedError({ cause }));
  }
}
