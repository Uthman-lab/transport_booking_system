// Typed domain errors for boarding check-in. Each maps to a distinct SQLSTATE
// raised by the check_in_booking RPC, so the scanner UI can show a precise,
// staff-friendly message per failure mode.

export class TicketNotFoundError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("No booking matches that ticket.", options);
    this.name = "TicketNotFoundError";
  }
}

export class TicketNotConfirmedError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("This ticket isn't a confirmed booking (unpaid or cancelled).", options);
    this.name = "TicketNotConfirmedError";
  }
}

export class TicketAlreadyCheckedInError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("This ticket has already been checked in.", options);
    this.name = "TicketAlreadyCheckedInError";
  }
}

export class NotAuthorizedToCheckInError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("You aren't authorized to check in tickets.", options);
    this.name = "NotAuthorizedToCheckInError";
  }
}

export class CheckInFailedError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Could not check in this ticket.", options);
    this.name = "CheckInFailedError";
  }
}
