-- Per-trip boarding roster for staff/admin.
--
-- Returns the confirmed passengers on a trip with their boarding status. Done
-- as an RPC (not a PostgREST embed) because bookings now has two FKs to profiles
-- (student_id and checked_in_by), which makes an embed ambiguous. SECURITY
-- DEFINER + an internal role check keeps it staff/admin-only; a non-staff caller
-- gets an empty array.
create or replace function public.get_trip_roster(p_trip_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'bookingId', b.id,
        'ticketCode', b.ticket_code,
        'seatNumber', b.seat_number,
        'passengerName', p.full_name,
        'checkedInAt', b.checked_in_at
      )
      order by b.seat_number
    ),
    '[]'::jsonb
  )
  from public.bookings b
  join public.profiles p on p.id = b.student_id
  where b.trip_id = p_trip_id
    and b.status = 'confirmed'
    and internal.current_user_role() in ('staff', 'admin');
$$;

revoke all on function public.get_trip_roster(uuid) from public, anon;
grant execute on function public.get_trip_roster(uuid) to authenticated;
