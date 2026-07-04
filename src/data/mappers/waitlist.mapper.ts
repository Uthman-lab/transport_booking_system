import type { WaitlistEntry, WaitlistStatus } from "@/domain/waitlist/waitlist.entity";

// Row shape matching public.waitlist_entries in the init schema migration.
export type WaitlistRow = {
  id: string;
  trip_id: string;
  student_id: string;
  status: string;
  created_at: string;
};

export function toWaitlistEntryEntity(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    tripId: row.trip_id,
    studentId: row.student_id,
    status: row.status as WaitlistStatus,
    createdAt: new Date(row.created_at),
  };
}
