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
  // Optional profile details (set on the created profile when provided).
  studentId?: string | null;
  phone?: string | null;
};

// A raw row from an uploaded spreadsheet (strings; validated by the use case).
export type BulkInviteInputRow = {
  fullName: string;
  email: string;
  role: string;
  studentId?: string | null;
  phone?: string | null;
};

// Per-row outcome of a bulk invite. `detail` holds the invite link on success
// or the failure reason otherwise.
export type BulkInviteRowResult = {
  rowNumber: number;
  email: string;
  role: UserRole | null;
  ok: boolean;
  detail: string;
};

// An invite link the admin can copy/share. Uses the token_hash flow that
// /auth/confirm understands, so it works regardless of email-template config.
export type InvitedUser = {
  id: string;
  email: string;
  role: UserRole;
  // The invite link — always returned so the admin can copy/send it manually.
  actionLink: string;
  // Whether the invite email was also sent (best-effort; false if SMTP isn't
  // configured or sending failed — the admin still has actionLink).
  emailed: boolean;
  // When emailed is false because a send was attempted and threw, this holds the
  // reason (e.g. Brevo rejecting an unverified sender). Undefined when SMTP is
  // simply not configured.
  emailError?: string;
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
  emailed: boolean;
  // See InvitedUser.emailError.
  emailError?: string;
};

export interface InviteRepository {
  inviteByEmail(input: InviteByEmailInput): Promise<InvitedUser>;
  // Creates every invite or none: if any row fails, the accounts already created
  // in this batch are deleted before the error propagates (transaction-like).
  inviteManyAtomic(inputs: InviteByEmailInput[]): Promise<InvitedUser[]>;
  listInviteStates(): Promise<InviteState[]>;
  resendInvite(userId: string): Promise<ResendResult>;
}
