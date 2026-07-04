import { TripNotBookableError } from "@/domain/booking/booking.errors";
import type { TripRepository } from "@/domain/trip/trip.repository";
import { canJoinWaitlist, type WaitlistEntry } from "@/domain/waitlist/waitlist.entity";
import type { WaitlistRepository } from "@/domain/waitlist/waitlist.repository";
import { err, ok, type Result } from "@/domain/shared/result";

export type JoinWaitlistDeps = {
  tripRepository: TripRepository;
  waitlistRepository: WaitlistRepository;
};

export async function joinWaitlist(
  { tripRepository, waitlistRepository }: JoinWaitlistDeps,
  tripId: string,
): Promise<Result<WaitlistEntry, Error>> {
  const trip = await tripRepository.findById(tripId);

  // Re-check the rule server-side: only a full, future, scheduled trip is
  // waitlist-eligible. Never trust that the client only showed the panel when
  // it was valid.
  if (!trip || !canJoinWaitlist(trip)) {
    return err(new TripNotBookableError(tripId));
  }

  try {
    const entry = await waitlistRepository.join(tripId);
    return ok(entry);
  } catch (cause) {
    // A duplicate active entry (partial unique index) is a harmless no-op from
    // the user's perspective — they're already on the list.
    return err(new Error("You're already on the waitlist for this trip.", { cause }));
  }
}
