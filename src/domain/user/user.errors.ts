// Typed domain errors for admin user management (parallels auth.errors.ts).
// Each maps to an expected failure the UI renders inline, so use cases hand
// them back as a Result instead of throwing opaque errors.

export class CannotChangeOwnRoleError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("You can't change your own role. Ask another admin to do it.", options);
    this.name = "CannotChangeOwnRoleError";
  }
}

export class CannotDeleteSelfError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("You can't delete your own account.", options);
    this.name = "CannotDeleteSelfError";
  }
}

// Raised when the database rejects a manage/delete because the target is an
// admin outside the acting admin's invite subtree (or otherwise off-limits).
export class NotAuthorizedToManageError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("You can only manage users you invited or their invitees.", options);
    this.name = "NotAuthorizedToManageError";
  }
}

export class UserRoleUpdateError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not update this user's role.", options);
    this.name = "UserRoleUpdateError";
  }
}

export class UserDetailsUpdateError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not update this user's details.", options);
    this.name = "UserDetailsUpdateError";
  }
}

export class UserDeleteError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not delete this user.", options);
    this.name = "UserDeleteError";
  }
}

export class InviteNotConfiguredError extends Error {
  constructor(options?: { cause?: unknown }) {
    super(
      "Email invitations aren't configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
      options,
    );
    this.name = "InviteNotConfiguredError";
  }
}

export class AdminAlreadyExistsError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("An account with this email already exists.", options);
    this.name = "AdminAlreadyExistsError";
  }
}

export class InviteFailedError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not create the invitation.", options);
    this.name = "InviteFailedError";
  }
}

export class InviteAlreadyAcceptedError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("This user has already accepted their invite.", options);
    this.name = "InviteAlreadyAcceptedError";
  }
}
