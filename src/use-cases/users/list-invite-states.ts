import type {
  InviteRepository,
  InviteState,
} from "@/domain/user/invite.repository";

export type ListInviteStatesDeps = {
  inviteRepository: InviteRepository;
};

export async function listInviteStates({
  inviteRepository,
}: ListInviteStatesDeps): Promise<InviteState[]> {
  return inviteRepository.listInviteStates();
}
