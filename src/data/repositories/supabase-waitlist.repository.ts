import type { SupabaseClient } from "@supabase/supabase-js";
import { toWaitlistEntryEntity, type WaitlistRow } from "@/data/mappers/waitlist.mapper";
import type { WaitlistEntry } from "@/domain/waitlist/waitlist.entity";
import type { WaitlistRepository } from "@/domain/waitlist/waitlist.repository";

export class SupabaseWaitlistRepository implements WaitlistRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async join(tripId: string): Promise<WaitlistEntry> {
    // Derive the acting student from the session, never from client input.
    // RLS ("with check student_id = auth.uid()") enforces the same invariant.
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("Not authenticated.");

    const { data, error } = await this.supabase
      .from("waitlist_entries")
      .insert({ trip_id: tripId, student_id: user.id })
      .select("*")
      .single<WaitlistRow>();

    if (error) throw error;
    return toWaitlistEntryEntity(data);
  }
}
