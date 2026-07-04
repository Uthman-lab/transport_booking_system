// Port for admin invitations. Implemented in the data layer with a service-role
// client — the only way to create an auth user, read invite state, and mint
// invite links — so it's a separate port from the RLS-bound UserRepository.
export type InviteAdminInput = {
  email: string;
  fullName: string;
  // The acting admin, recorded as the new admin's inviter (invited_by).
  invitedBy: string;
};

// An invite link the admin can copy/share. Uses the token_hash flow that
// /auth/confirm understands, so it works regardless of email-template config.
export type InvitedAdmin = {
  id: string;
  email: string;
  actionLink: string;
};

// Per-user invite state, sourced from auth.users.
export type InviteState = {
  userId: string;
  email: string;
  // Invited by email but not yet accepted (invited_at set, email unconfirmed).
  pending: boolean;
};

export type ResendResult = {
  email: string;
  actionLink: string;
};

export interface InviteRepository {
  inviteAdminByEmail(input: InviteAdminInput): Promise<InvitedAdmin>;
  listInviteStates(): Promise<InviteState[]>;
  resendInvite(userId: string): Promise<ResendResult>;
}
