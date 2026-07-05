import type { CheckInResult } from "./check-in.entity";

// Port implemented by the data layer. checkIn marks boarding for a ticket code
// and returns the passenger/trip details, or throws for the data layer's
// provider errors (which the use case translates into the typed domain errors).
export interface CheckInRepository {
  checkIn(ticketCode: string): Promise<CheckInResult>;
}
