export class TripNotBookableError extends Error {
  constructor(tripId: string) {
    super(`Trip ${tripId} is not open for booking.`);
    this.name = "TripNotBookableError";
  }
}

export class SeatUnavailableError extends Error {
  constructor(seatNumber: number, options?: { cause?: unknown }) {
    super(`Seat ${seatNumber} is no longer available on this trip.`, options);
    this.name = "SeatUnavailableError";
  }
}
