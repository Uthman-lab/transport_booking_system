// Typed domain errors for the auth feature (parallels booking.errors.ts).
// Each maps to an expected failure the UI must distinguish and render inline,
// so use cases hand them back as a Result instead of throwing opaque errors.

export class InvalidCredentialsError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Incorrect email or password.", options);
    this.name = "InvalidCredentialsError";
  }
}

export class EmailNotConfirmedError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Please confirm your email before signing in. Check your inbox for the link.", options);
    this.name = "EmailNotConfirmedError";
  }
}

export class EmailAlreadyRegisteredError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("An account with this email already exists.", options);
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class StudentIdTakenError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("This student ID is already registered.", options);
    this.name = "StudentIdTakenError";
  }
}

export class WeakPasswordError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Password is too weak. Use at least 6 characters.", options);
    this.name = "WeakPasswordError";
  }
}

export class EmailRateLimitError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Too many emails sent recently. Please wait a few minutes and try again.", options);
    this.name = "EmailRateLimitError";
  }
}
