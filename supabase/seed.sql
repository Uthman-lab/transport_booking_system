-- Deterministic, idempotent seed: routes + upcoming trips only.
--
-- Bookings are intentionally NOT seeded: a booking needs a real auth.users row
-- (student_id references public.profiles → auth.users), and coupling this file
-- to auth fixtures is brittle. Instead, create holds live during testing by
-- booking through the UI. That also exercises the concurrency-safe RPCs.
--
-- Fixed UUIDs + "on conflict do nothing" make re-running (supabase db reset)
-- safe. departure_at is computed relative to now() so trips always stay in the
-- future regardless of when the seed runs.
--
-- The UUIDs are valid RFC-4122 v4 (version nibble 4, variant nibble 8): trip
-- ids flow through Server Actions that validate them with zod's `.uuid()`,
-- which rejects UUIDs with a non-conforming version/variant even though
-- Postgres's lenient `uuid` type would accept them.

insert into public.routes (id, origin, destination) values
  ('11111111-1111-4111-8111-111111111101', 'Campus', 'City Center'),
  ('11111111-1111-4111-8111-111111111102', 'Campus', 'Airport'),
  ('11111111-1111-4111-8111-111111111103', 'Campus', 'Mega Mall')
on conflict (id) do nothing;

insert into public.trips (id, route_id, departure_at, capacity, price_ghs, status) values
  -- Roomy trips for eyeballing the seat map.
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101', now() + interval '1 day',  12, 15.00, 'scheduled'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102', now() + interval '2 days', 14, 40.00, 'scheduled'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111103', now() + interval '1 day',  10, 10.00, 'scheduled'),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111101', now() + interval '3 days', 12, 15.00, 'scheduled'),
  -- Tiny capacity so the "full trip → waitlist" path is easy to reach live.
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111102', now() + interval '2 days', 2,  40.00, 'scheduled')
on conflict (id) do nothing;
