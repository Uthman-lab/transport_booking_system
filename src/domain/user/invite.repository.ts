// Port for inviting a new admin by email. Implemented in the data layer with a
// service-role client (the only way to create an auth user + send the invite),
// so it's a separate port from the RLS-bound UserRepository.
export type InviteAdminInput = {
  email: string;
  fullName: string;
  // The acting admin, recorded as the new admin's inviter (invited_by).
  invitedBy: string;
};

export type InvitedAdmin = {
  id: string;
  email: string;
};

export interface InviteRepository {
  inviteAdminByEmail(input: InviteAdminInput): Promise<InvitedAdmin>;
}
