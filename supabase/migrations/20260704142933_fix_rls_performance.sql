-- Address advisor findings from the init_schema migration:
--  1. auth.uid() re-evaluated per row -> wrap in (select ...) so it's evaluated once.
--  2. routes/trips had two overlapping permissive SELECT policies -> split admin
--     policies into insert/update/delete only, leaving one SELECT policy per table.
--  3. missing index on waitlist_entries.student_id.

create index idx_waitlist_student on public.waitlist_entries (student_id);

-- profiles ------------------------------------------------------------------
drop policy "profiles are viewable by owner or staff" on public.profiles;
create policy "profiles are viewable by owner or staff"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('admin', 'staff')
    )
  );

drop policy "profiles are updatable by owner or admin" on public.profiles;
create policy "profiles are updatable by owner or admin"
  on public.profiles for update
  to authenticated
  using (
    id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

-- routes ----------------------------------------------------------------
drop policy "routes are manageable by admin" on public.routes;
create policy "routes are insertable by admin"
  on public.routes for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "routes are updatable by admin"
  on public.routes for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "routes are deletable by admin"
  on public.routes for delete
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- trips -------------------------------------------------------------------
drop policy "trips are manageable by admin" on public.trips;
create policy "trips are insertable by admin"
  on public.trips for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "trips are updatable by admin"
  on public.trips for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "trips are deletable by admin"
  on public.trips for delete
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

-- bookings ------------------------------------------------------------------
drop policy "bookings are viewable by owner or staff" on public.bookings;
create policy "bookings are viewable by owner or staff"
  on public.bookings for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'staff'))
  );

drop policy "students can create their own bookings" on public.bookings;
create policy "students can create their own bookings"
  on public.bookings for insert
  to authenticated
  with check (student_id = (select auth.uid()));

drop policy "bookings are updatable by owner or admin" on public.bookings;
create policy "bookings are updatable by owner or admin"
  on public.bookings for update
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );

-- waitlist_entries ------------------------------------------------------------
drop policy "waitlist entries are viewable by owner or staff" on public.waitlist_entries;
create policy "waitlist entries are viewable by owner or staff"
  on public.waitlist_entries for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role in ('admin', 'staff'))
  );

drop policy "students can join a waitlist" on public.waitlist_entries;
create policy "students can join a waitlist"
  on public.waitlist_entries for insert
  to authenticated
  with check (student_id = (select auth.uid()));

drop policy "waitlist entries are updatable by owner or admin" on public.waitlist_entries;
create policy "waitlist entries are updatable by owner or admin"
  on public.waitlist_entries for update
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
  );
