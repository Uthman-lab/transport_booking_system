import type { UserRole } from "@/domain/auth/auth-user.entity";

// Port for user invitations. Implemented in the data layer with a service-role
// client — the only way to create an auth user, read invite state, and mint
// invite links — so it's a separate port from the RLS-bound UserRepository.
export type InviteByEmailInput = {
  email: string;
  fullName: string;
  // The role the invitee joins as (student / staff / admin).
  role: UserRole;
  // The acting admin, recorded as the invitee's inviter (invited_by).
  invitedBy: string;
};

// An invite link the admin can copy/share. Uses the token_hash flow that
// /auth/confirm understands, so it works regardless of email-template config.
export type InvitedUser = {
  id: string;
  email: string;
  role: UserRole;
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
  inviteByEmail(input: InviteByEmailInput): Promise<InvitedUser>;
  listInviteStates(): Promise<InviteState[]>;
  resendInvite(userId: string): Promise<ResendResult>;
}
