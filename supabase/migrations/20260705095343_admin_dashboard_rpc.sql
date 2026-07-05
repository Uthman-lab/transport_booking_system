-- Admin analytics: demand / occupancy / revenue dashboard.
--
-- Aggregation happens in SQL (not client-side) for two reasons:
--   1. Correctness — the Data API caps rows at 1000 (config.toml api.max_rows),
--      so selecting every booking and summing in JS would silently truncate.
--   2. Efficiency — one round trip returns pre-computed totals.
--
-- Follows the get_trip_roster precedent: a public SECURITY DEFINER function
-- returning jsonb, gated to admins via internal.current_user_role(). A
-- non-admin caller gets null (no data leak), mirroring the roster's "empty for
-- non-authorized" behaviour. Occupancy *rates* are intentionally NOT computed
-- here — the raw sold/capacity counts are returned and the domain layer derives
-- the ratio as a pure function.
--
-- Metric definitions (every metric excludes CANCELLED trips, so revenue,
-- seats-sold, capacity, and occupancy stay internally consistent — a cancelled
-- trip is not part of operations, so occupancy can never exceed 100%):
--   * Revenue / seats sold  -> CONFIRMED bookings on non-cancelled trips
--     (held = unpaid, cancelled booking = released). Each seat valued at price.
--   * Capacity / occupancy  -> capacity of non-cancelled trips.
--   * Demand                -> 'waiting' waitlist entries on non-cancelled trips.
create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_summary jsonb;
  v_routes jsonb;
  v_daily jsonb;
begin
  -- Definer rights bypass RLS, so authorize explicitly. Use IS DISTINCT FROM so
  -- a NULL role (no JWT / missing profile) is gated out too — a plain `<>`
  -- would evaluate to NULL and fall through.
  if internal.current_user_role() is distinct from 'admin' then
    return null;
  end if;

  -- Summary KPIs.
  select jsonb_build_object(
    'totalRevenueGhs', coalesce((
      select sum(t.price_ghs)
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      where b.status = 'confirmed' and t.status <> 'cancelled'
    ), 0),
    'seatsSold', (
      select count(*)
      from public.bookings b
      join public.trips t on t.id = b.trip_id
      where b.status = 'confirmed' and t.status <> 'cancelled'
    ),
    'capacity', coalesce((
      select sum(capacity) from public.trips where status <> 'cancelled'
    ), 0),
    'totalTrips', (select count(*) from public.trips),
    'activeTrips', (
      select count(*) from public.trips
      where status = 'scheduled' and departure_at > now()
    ),
    'waitlistWaiting', (
      select count(*)
      from public.waitlist_entries w
      join public.trips t on t.id = w.trip_id
      where w.status = 'waiting' and t.status <> 'cancelled'
    )
  )
  into v_summary;

  -- Per-route breakdown, ordered by revenue (highest earners first).
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'routeId', r.id,
        'origin', r.origin,
        'destination', r.destination,
        'trips', coalesce(caps.trips, 0),
        'capacity', coalesce(caps.capacity, 0),
        'seatsSold', coalesce(sold.seats_sold, 0),
        'revenueGhs', coalesce(sold.revenue, 0),
        'waitlistWaiting', coalesce(wait.waiting, 0)
      )
      order by coalesce(sold.revenue, 0) desc, r.origin
    ),
    '[]'::jsonb
  )
  into v_routes
  from public.routes r
  -- INNER: a route only appears once it has at least one non-cancelled trip,
  -- so the performance table lists operational routes, not empty definitions.
  join (
    select route_id, count(*) as trips, sum(capacity) as capacity
    from public.trips
    where status <> 'cancelled'
    group by route_id
  ) caps on caps.route_id = r.id
  left join (
    select t.route_id, count(*) as seats_sold, sum(t.price_ghs) as revenue
    from public.bookings b
    join public.trips t on t.id = b.trip_id
    where b.status = 'confirmed' and t.status <> 'cancelled'
    group by t.route_id
  ) sold on sold.route_id = r.id
  left join (
    select t.route_id, count(*) as waiting
    from public.waitlist_entries w
    join public.trips t on t.id = w.trip_id
    where w.status = 'waiting' and t.status <> 'cancelled'
    group by t.route_id
  ) wait on wait.route_id = r.id;

  -- 14-day trend: confirmed bookings bucketed by creation date (UTC),
  -- zero-filled so the series has no gaps.
  with days as (
    select ((now() at time zone 'UTC')::date - g.n) as day
    from generate_series(0, 13) as g(n)
  ),
  agg as (
    select (b.created_at at time zone 'UTC')::date as day,
           count(*) as bookings,
           sum(t.price_ghs) as revenue
    from public.bookings b
    join public.trips t on t.id = b.trip_id
    where b.status = 'confirmed' and t.status <> 'cancelled'
      and b.created_at >= (now() at time zone 'UTC')::date - 13
    group by 1
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', to_char(days.day, 'YYYY-MM-DD'),
        'bookings', coalesce(agg.bookings, 0),
        'revenueGhs', coalesce(agg.revenue, 0)
      )
      order by days.day
    ),
    '[]'::jsonb
  )
  into v_daily
  from days
  left join agg on agg.day = days.day;

  return jsonb_build_object(
    'summary', v_summary,
    'routes', v_routes,
    'daily', v_daily
  );
end;
$$;

revoke all on function public.get_admin_dashboard() from public, anon;
grant execute on function public.get_admin_dashboard() to authenticated;
