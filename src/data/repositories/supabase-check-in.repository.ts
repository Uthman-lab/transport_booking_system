import type { SupabaseClient } from "@supabase/supabase-js";
import { toCheckInResult, type CheckInRow } from "@/data/mappers/check-in.mapper";
import type { CheckInResult } from "@/domain/check-in/check-in.entity";
import type { CheckInRepository } from "@/domain/check-in/check-in.repository";

export class SupabaseCheckInRepository implements CheckInRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async checkIn(ticketCode: string): Promise<CheckInResult> {
    // check_in_booking authorizes (staff/admin) and enforces the boarding rules
    // in the DB, raising distinct SQLSTATEs the use case maps to domain errors.
    const { data, error } = await this.supabase.rpc("check_in_booking", {
      p_ticket_code: ticketCode,
    });

    if (error) throw error;
    return toCheckInResult(data as CheckInRow);
  }
}
