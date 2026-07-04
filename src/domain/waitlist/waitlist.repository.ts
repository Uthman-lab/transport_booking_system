import type { WaitlistEntry } from "./waitlist.entity";

// Port implemented by the data layer. `join` derives the acting student from
// the session inside the data layer (never from client input); RLS enforces it
// again. The partial unique index makes a duplicate active join a no-op error.
export interface WaitlistRepository {
  join(tripId: string): Promise<WaitlistEntry>;
}
