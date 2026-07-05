import type { RosterEntry } from "@/domain/roster/roster.entity";
import type { RosterRepository } from "@/domain/roster/roster.repository";

export type GetTripRosterDeps = {
  rosterRepository: RosterRepository;
};

export async function getTripRoster(
  { rosterRepository }: GetTripRosterDeps,
  tripId: string,
): Promise<RosterEntry[]> {
  return rosterRepository.listForTrip(tripId);
}
