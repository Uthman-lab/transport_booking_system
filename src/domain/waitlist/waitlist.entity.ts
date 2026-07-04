import { availableSeats, type Trip } from "@/domain/trip/trip.entity";

export type WaitlistStatus = "waiting" | "promoted" | "expired";

export type WaitlistEntry = {
  id: string;
  tripId: string;
  studentId: string;
  status: WaitlistStatus;
  createdAt: Date;
};

// A student may join a waitlist only for a future scheduled trip that is
// currently full. `now` is a parameter (with a default) so the rule stays pure
// and testable.
export function canJoinWaitlist(trip: Trip, now: Date = new Date()): boolean {
  return (
    trip.status === "scheduled" &&
    trip.departureAt.getTime() > now.getTime() &&
    availableSeats(trip) === 0
  );
}
