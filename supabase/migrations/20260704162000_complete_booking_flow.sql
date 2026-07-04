-- Seat map support: expose which seats are taken on a trip WITHOUT leaking
-- who holds them.
--
-- A student's RLS SELECT policy on public.bookings only returns their own
-- rows, so the client cannot compute a seat map from the table directly. This
-- function returns just the occupied seat numbers (no student_id, read-only).
--
-- Honors the skill rule "no SECURITY DEFINER function in a PostgREST-exposed
-- schema": the definer body lives in the internal schema (not exposed by
-- PostgREST), and a thin SECURITY INVOKER wrapper in public is what the client
-- calls via .rpc(). authenticated may execute the wrapper only.

create or replace function internal.occupied_seats(p_trip_id uuid)
returns setof int
language sql
security definer
stable
set search_path = ''
as $$
  select seat_number
  from public.bookings
  where trip_id = p_trip_id
    and status in ('held', 'confirmed');
$$;

revoke all on function internal.occupied_seats(uuid) from public, anon;
grant execute on function internal.occupied_seats(uuid) to authenticated;

-- Public invoker-rights wrapper: this is the REST-callable surface. It returns
-- only integers, so no identity is exposed even though the underlying read is
-- privileged.
create or replace function public.get_occupied_seats(p_trip_id uuid)
returns setof int
language sql
security invoker
stable
set search_path = ''
as $$
  select * from internal.occupied_seats(p_trip_id);
$$;

revoke all on function public.get_occupied_seats(uuid) from public, anon;
grant execute on function public.get_occupied_seats(uuid) to authenticated;
