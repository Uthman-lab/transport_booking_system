-- UBBS core schema: profiles, routes, trips, bookings, waitlist
-- + concurrency-safe seat booking and waitlist promotion.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron with schema extensions;

create schema if not exists internal;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  student_id text unique,
  phone text,
  role text not null default 'student' check (role in ('student', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner or staff"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'staff')
    )
  );

create policy "profiles are updatable by owner or admin"
  on public.profiles for update
  to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Prevent students from granting themselves admin/staff access.
create function internal.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role <> old.role and not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function internal.prevent_role_self_escalation();

-- Auto-create a profile row whenever a new auth user signs up.
create function internal.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function internal.handle_new_user();

-- ---------------------------------------------------------------------------
-- routes
-- ---------------------------------------------------------------------------
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  created_at timestamptz not null default now()
);

alter table public.routes enable row level security;

create policy "routes are viewable by authenticated users"
  on public.routes for select
  to authenticated
  using (true);

create policy "routes are manageable by admin"
  on public.routes for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- trips (a scheduled bus run on a route)
-- ---------------------------------------------------------------------------
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  departure_at timestamptz not null,
  capacity int not null check (capacity > 0),
  price_ghs numeric(10, 2) not null default 0,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index idx_trips_route_departure on public.trips (route_id, departure_at);

alter table public.trips enable row level security;

create policy "trips are viewable by authenticated users"
  on public.trips for select
  to authenticated
  using (true);

create policy "trips are manageable by admin"
  on public.trips for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  seat_number int not null,
  status text not null default 'held' check (status in ('held', 'confirmed', 'cancelled')),
  hold_expires_at timestamptz not null default (now() + interval '15 minutes'),
  ticket_code text not null default encode(extensions.gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);

-- Only one active (held or confirmed) booking per seat per trip.
create unique index idx_bookings_active_seat
  on public.bookings (trip_id, seat_number)
  where status in ('held', 'confirmed');

create index idx_bookings_student on public.bookings (student_id);

-- Enforce seat_number is within the trip's capacity (cross-table check).
create function internal.enforce_seat_bounds()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trip_capacity int;
begin
  select capacity into trip_capacity from public.trips where id = new.trip_id;

  if trip_capacity is null then
    raise exception 'Trip % does not exist', new.trip_id;
  end if;

  if new.seat_number < 1 or new.seat_number > trip_capacity then
    raise exception 'Seat % is out of range for this trip (capacity %)', new.seat_number, trip_capacity;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_seat_bounds
  before insert on public.bookings
  for each row execute function internal.enforce_seat_bounds();

alter table public.bookings enable row level security;

create policy "bookings are viewable by owner or staff"
  on public.bookings for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
  );

create policy "students can create their own bookings"
  on public.bookings for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "bookings are updatable by owner or admin"
  on public.bookings for update
  to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------
create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'promoted', 'expired')),
  created_at timestamptz not null default now()
);

create unique index idx_waitlist_one_active_entry
  on public.waitlist_entries (trip_id, student_id)
  where status = 'waiting';

alter table public.waitlist_entries enable row level security;

create policy "waitlist entries are viewable by owner or staff"
  on public.waitlist_entries for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'staff'))
  );

create policy "students can join a waitlist"
  on public.waitlist_entries for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "waitlist entries are updatable by owner or admin"
  on public.waitlist_entries for update
  to authenticated
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- booking lifecycle functions (called via supabase-js .rpc())
-- ---------------------------------------------------------------------------

-- Reserves a seat for the calling student. Relies on idx_bookings_active_seat
-- to make concurrent attempts on the same seat resolve to a single winner.
create function public.create_booking(p_trip_id uuid, p_seat_number int)
returns public.bookings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_booking public.bookings;
  v_trip public.trips;
begin
  select * into v_trip from public.trips where id = p_trip_id;

  if v_trip is null or v_trip.status <> 'scheduled' or v_trip.departure_at <= now() then
    raise exception 'This trip is not open for booking';
  end if;

  begin
    insert into public.bookings (trip_id, student_id, seat_number)
    values (p_trip_id, auth.uid(), p_seat_number)
    returning * into v_booking;
  exception when unique_violation then
    raise exception 'Seat % is already taken for this trip', p_seat_number;
  end;

  return v_booking;
end;
$$;

revoke all on function public.create_booking(uuid, int) from public;
grant execute on function public.create_booking(uuid, int) to authenticated;

-- Simulates payment success and confirms a held booking.
create function public.confirm_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  update public.bookings
  set status = 'confirmed'
  where id = p_booking_id
    and student_id = auth.uid()
    and status = 'held'
    and hold_expires_at > now()
  returning * into v_booking;

  if v_booking is null then
    raise exception 'Booking not found, already handled, or hold expired';
  end if;

  return v_booking;
end;
$$;

revoke all on function public.confirm_booking(uuid) from public;
grant execute on function public.confirm_booking(uuid) to authenticated;

-- Cancels a booking (owner or admin) and promotes the next waitlist entry.
create function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
    and status in ('held', 'confirmed')
    and (
      student_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  returning * into v_booking;

  if v_booking is null then
    raise exception 'Booking not found or already cancelled';
  end if;

  perform internal.promote_next_waitlist(v_booking.trip_id);

  return v_booking;
end;
$$;

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- internal maintenance (runs on a schedule, not client-callable)
-- ---------------------------------------------------------------------------

-- Frees seats whose hold timer expired without payment confirmation.
create function internal.expire_held_bookings()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.bookings
  set status = 'cancelled'
  where status = 'held' and hold_expires_at <= now();
$$;

-- Promotes the oldest waiting entry into a held booking on the first free seat.
create function internal.promote_next_waitlist(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next_seat int;
  v_entry public.waitlist_entries;
begin
  select w.* into v_entry
  from public.waitlist_entries w
  where w.trip_id = p_trip_id and w.status = 'waiting'
  order by w.created_at
  limit 1
  for update skip locked;

  if v_entry is null then
    return;
  end if;

  select seat
  into v_next_seat
  from generate_series(1, (select capacity from public.trips where id = p_trip_id)) as seat
  where seat not in (
    select seat_number from public.bookings
    where trip_id = p_trip_id and status in ('held', 'confirmed')
  )
  order by seat
  limit 1;

  if v_next_seat is null then
    return;
  end if;

  insert into public.bookings (trip_id, student_id, seat_number)
  values (p_trip_id, v_entry.student_id, v_next_seat);

  update public.waitlist_entries set status = 'promoted' where id = v_entry.id;
end;
$$;

-- Run every minute to release expired seat holds back into the pool.
select cron.schedule(
  'expire-held-bookings',
  '* * * * *',
  $$select internal.expire_held_bookings();$$
);
