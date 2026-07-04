-- Fix infinite recursion (Postgres error 42P17) in RLS policies.
--
-- The profiles SELECT/UPDATE policies queried public.profiles from *within* a
-- policy defined ON public.profiles, so any read of a profile row re-triggered
-- the same policy forever. Because every other table's admin/staff check also
-- subqueries public.profiles, they inherited the recursion transitively.
--
-- Fix: a SECURITY DEFINER helper that reads the caller's role while bypassing
-- RLS (it runs as the table owner), referenced from the policies instead of a
-- self-referential subquery. This is the pattern Supabase recommends for
-- role-based RLS and also removes the per-row profiles subquery.

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- Only signed-in users evaluate these policies; keep it off the public API.
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;

-- profiles ------------------------------------------------------------------
drop policy "profiles are viewable by owner or staff" on public.profiles;
create policy "profiles are viewable by owner or staff"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.current_user_role() in ('admin', 'staff')
  );

drop policy "profiles are updatable by owner or admin" on public.profiles;
create policy "profiles are updatable by owner or admin"
  on public.profiles for update
  to authenticated
  using (
    id = (select auth.uid())
    or public.current_user_role() = 'admin'
  );

-- routes --------------------------------------------------------------------
drop policy "routes are insertable by admin" on public.routes;
create policy "routes are insertable by admin"
  on public.routes for insert to authenticated
  with check (public.current_user_role() = 'admin');

drop policy "routes are updatable by admin" on public.routes;
create policy "routes are updatable by admin"
  on public.routes for update to authenticated
  using (public.current_user_role() = 'admin');

drop policy "routes are deletable by admin" on public.routes;
create policy "routes are deletable by admin"
  on public.routes for delete to authenticated
  using (public.current_user_role() = 'admin');

-- trips ---------------------------------------------------------------------
drop policy "trips are insertable by admin" on public.trips;
create policy "trips are insertable by admin"
  on public.trips for insert to authenticated
  with check (public.current_user_role() = 'admin');

drop policy "trips are updatable by admin" on public.trips;
create policy "trips are updatable by admin"
  on public.trips for update to authenticated
  using (public.current_user_role() = 'admin');

drop policy "trips are deletable by admin" on public.trips;
create policy "trips are deletable by admin"
  on public.trips for delete to authenticated
  using (public.current_user_role() = 'admin');

-- bookings ------------------------------------------------------------------
drop policy "bookings are viewable by owner or staff" on public.bookings;
create policy "bookings are viewable by owner or staff"
  on public.bookings for select to authenticated
  using (
    student_id = (select auth.uid())
    or public.current_user_role() in ('admin', 'staff')
  );

drop policy "bookings are updatable by owner or admin" on public.bookings;
create policy "bookings are updatable by owner or admin"
  on public.bookings for update to authenticated
  using (
    student_id = (select auth.uid())
    or public.current_user_role() = 'admin'
  );

-- waitlist_entries ----------------------------------------------------------
drop policy "waitlist entries are viewable by owner or staff" on public.waitlist_entries;
create policy "waitlist entries are viewable by owner or staff"
  on public.waitlist_entries for select to authenticated
  using (
    student_id = (select auth.uid())
    or public.current_user_role() in ('admin', 'staff')
  );

drop policy "waitlist entries are updatable by owner or admin" on public.waitlist_entries;
create policy "waitlist entries are updatable by owner or admin"
  on public.waitlist_entries for update to authenticated
  using (
    student_id = (select auth.uid())
    or public.current_user_role() = 'admin'
  );
