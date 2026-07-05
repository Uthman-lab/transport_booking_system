import type { CheckInResult } from "@/domain/check-in/check-in.entity";
import {
  CheckInFailedError,
  NotAuthorizedToCheckInError,
  TicketAlreadyCheckedInError,
  TicketNotConfirmedError,
  TicketNotFoundError,
} from "@/domain/check-in/check-in.errors";
import type { CheckInRepository } from "@/domain/check-in/check-in.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type CheckInTicketDeps = {
  checkInRepository: CheckInRepository;
};

// Structural read of a Postgres/PostgREST error code without importing
// @supabase/* into the use-cases layer.
function pgCode(cause: unknown): string | undefined {
  return typeof cause === "object" && cause !== null && "code" in cause
    ? String((cause as { code?: unknown }).code)
    : undefined;
}

export async function checkInTicket(
  { checkInRepository }: CheckInTicketDeps,
  ticketCode: string,
): Promise<Result<CheckInResult, Error>> {
  const code = ticketCode.trim();
  if (!code) return err(new TicketNotFoundError());

  try {
    return ok(await checkInRepository.checkIn(code));
  } catch (cause) {
    switch (pgCode(cause)) {
      case "PT404":
        return err(new TicketNotFoundError({ cause }));
      case "PT412":
        return err(new TicketNotConfirmedError({ cause }));
      case "PT409":
        return err(new TicketAlreadyCheckedInError({ cause }));
      case "42501":
        return err(new NotAuthorizedToCheckInError({ cause }));
      default:
        return err(new CheckInFailedError({ cause }));
    }
  }
}
