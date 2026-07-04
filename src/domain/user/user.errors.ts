// Typed domain errors for admin user management (parallels auth.errors.ts).
// Each maps to an expected failure the UI renders inline, so use cases hand
// them back as a Result instead of throwing opaque errors.

export class CannotChangeOwnRoleError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("You can't change your own role. Ask another admin to do it.", options);
    this.name = "CannotChangeOwnRoleError";
  }
}

export class UserRoleUpdateError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not update this user's role.", options);
    this.name = "UserRoleUpdateError";
  }
}
