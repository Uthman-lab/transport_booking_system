export type TripStatus = "scheduled" | "cancelled" | "completed";

export type Trip = {
  id: string;
  routeId: string;
  origin: string;
  destination: string;
  departureAt: Date;
  capacity: number;
  priceGhs: number;
  status: TripStatus;
  seatsBooked: number;
};

export function availableSeats(trip: Trip): number {
  return Math.max(trip.capacity - trip.seatsBooked, 0);
}

export function isBookable(trip: Trip, now: Date = new Date()): boolean {
  return (
    trip.status === "scheduled" &&
    trip.departureAt.getTime() > now.getTime() &&
    availableSeats(trip) > 0
  );
}

// A trip may only be scheduled for a future departure. Pure rule (now is a
// parameter) so admin use-cases can enforce it without touching the clock
// directly.
export function isSchedulable(departureAt: Date, now: Date = new Date()): boolean {
  return departureAt.getTime() > now.getTime();
}
