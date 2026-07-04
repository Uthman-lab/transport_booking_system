-- Advisor fix: authenticated_security_definer_function_executable.
--
-- public.current_user_role() sat in the PostgREST-exposed public schema, so it
-- was callable as a REST RPC (/rest/v1/rpc/current_user_role) — an unnecessary
-- surface for a SECURITY DEFINER function. Move it into the internal schema
-- (not exposed by PostgREST) so it remains usable inside RLS policies but is
-- unreachable over the API. Re-point every policy, then drop the public copy.

create or replace function internal.current_user_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- RLS policy evaluation runs as the querying role, so authenticated needs
-- schema USAGE + EXECUTE. internal is not in PostgREST's exposed schemas, so
-- this grants no REST access.
grant usage on schema internal to authenticated;
revoke all on function internal.current_user_role() from public, anon;
grant execute on function internal.current_user_role() to authenticated;

-- profiles ------------------------------------------------------------------
drop policy "profiles are viewable by owner or staff" on public.profiles;
create policy "profiles are viewable by owner or staff"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or internal.current_user_role() in ('admin', 'staff')
  );

drop policy "profiles are updatable by owner or admin" on public.profiles;
create policy "profiles are updatable by owner or admin"
  on public.profiles for update
  to authenticated
  using (
    id = (select auth.uid())
    or internal.current_user_role() = 'admin'
  );

-- routes --------------------------------------------------------------------
drop policy "routes are insertable by admin" on public.routes;
create policy "routes are insertable by admin"
  on public.routes for insert to authenticated
  with check (internal.current_user_role() = 'admin');

drop policy "routes are updatable by admin" on public.routes;
create policy "routes are updatable by admin"
  on public.routes for update to authenticated
  using (internal.current_user_role() = 'admin');

drop policy "routes are deletable by admin" on public.routes;
create policy "routes are deletable by admin"
  on public.routes for delete to authenticated
  using (internal.current_user_role() = 'admin');

-- trips ---------------------------------------------------------------------
drop policy "trips are insertable by admin" on public.trips;
create policy "trips are insertable by admin"
  on public.trips for insert to authenticated
  with check (internal.current_user_role() = 'admin');

drop policy "trips are updatable by admin" on public.trips;
create policy "trips are updatable by admin"
  on public.trips for update to authenticated
  using (internal.current_user_role() = 'admin');

drop policy "trips are deletable by admin" on public.trips;
create policy "trips are deletable by admin"
  on public.trips for delete to authenticated
  using (internal.current_user_role() = 'admin');

-- bookings ------------------------------------------------------------------
drop policy "bookings are viewable by owner or staff" on public.bookings;
create policy "bookings are viewable by owner or staff"
  on public.bookings for select to authenticated
  using (
    student_id = (select auth.uid())
    or internal.current_user_role() in ('admin', 'staff')
  );

drop policy "bookings are updatable by owner or admin" on public.bookings;
create policy "bookings are updatable by owner or admin"
  on public.bookings for update to authenticated
  using (
    student_id = (select auth.uid())
    or internal.current_user_role() = 'admin'
  );

-- waitlist_entries ----------------------------------------------------------
drop policy "waitlist entries are viewable by owner or staff" on public.waitlist_entries;
create policy "waitlist entries are viewable by owner or staff"
  on public.waitlist_entries for select to authenticated
  using (
    student_id = (select auth.uid())
    or internal.current_user_role() in ('admin', 'staff')
  );

drop policy "waitlist entries are updatable by owner or admin" on public.waitlist_entries;
create policy "waitlist entries are updatable by owner or admin"
  on public.waitlist_entries for update to authenticated
  using (
    student_id = (select auth.uid())
    or internal.current_user_role() = 'admin'
  );

drop function public.current_user_role();
