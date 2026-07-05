-- Staff QR check-in / boarding scan.
--
-- Records boarding on a confirmed booking. Staff (and admins) scan a ticket's
-- QR — which encodes the booking's ticket_code — and this RPC marks attendance.

alter table public.bookings
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by uuid references public.profiles (id) on delete set null;

-- Check a passenger in by ticket code. SECURITY DEFINER so it can update the row
-- and read the joined trip/passenger regardless of the caller's RLS; the
-- internal role check makes the exposed RPC safe. Returns the details staff need
-- to eyeball at the door. Distinct SQLSTATEs let the UI show precise messages.
create or replace function public.check_in_booking(p_ticket_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_status text;
  v_checked timestamptz;
  v_result jsonb;
begin
  if internal.current_user_role() not in ('staff', 'admin') then
    raise exception 'Not authorized to check in tickets.' using errcode = '42501';
  end if;

  -- Lock the row so two concurrent scans can't both mark the first boarding.
  select b.id, b.status, b.checked_in_at
    into v_id, v_status, v_checked
    from public.bookings b
    where lower(b.ticket_code) = lower(btrim(p_ticket_code))
    for update;

  if not found then
    raise exception 'No booking matches that ticket.' using errcode = 'PT404';
  end if;

  if v_status <> 'confirmed' then
    raise exception 'Ticket is not a confirmed booking.' using errcode = 'PT412';
  end if;

  if v_checked is not null then
    raise exception 'Ticket already checked in.' using errcode = 'PT409';
  end if;

  update public.bookings
    set checked_in_at = now(), checked_in_by = (select auth.uid())
    where id = v_id;

  select jsonb_build_object(
    'ticketCode', b.ticket_code,
    'passengerName', p.full_name,
    'seatNumber', b.seat_number,
    'origin', r.origin,
    'destination', r.destination,
    'departureAt', t.departure_at,
    'checkedInAt', b.checked_in_at
  )
  into v_result
  from public.bookings b
  join public.trips t on t.id = b.trip_id
  left join public.routes r on r.id = t.route_id
  join public.profiles p on p.id = b.student_id
  where b.id = v_id;

  return v_result;
end;
$$;

revoke all on function public.check_in_booking(text) from public, anon;
grant execute on function public.check_in_booking(text) to authenticated;
