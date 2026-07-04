-- Admin user management: invitation hierarchy + hierarchy-scoped modify/delete.
--
-- Model: users form an invitation tree via profiles.invited_by. An admin may
-- modify or delete:
--   * any NON-admin user (student/staff), and
--   * admin users inside their own invite subtree (whom they invited,
--     transitively — invitees, and their invitees, ...),
-- but NEVER themselves, and never an admin outside their subtree (a peer, their
-- own inviter, or an unrelated admin tree). Deletion is a hard delete.

-- ---------------------------------------------------------------------------
-- 1. Invitation link
-- ---------------------------------------------------------------------------
-- Who promoted/invited this user to their (privileged) role. Null for the
-- bootstrap/root admins and for self-registered students. ON DELETE SET NULL so
-- removing an inviter simply re-roots their invitees rather than cascading.
alter table public.profiles
  add column if not exists invited_by uuid references public.profiles (id) on delete set null;

create index if not exists idx_profiles_invited_by on public.profiles (invited_by);

-- ---------------------------------------------------------------------------
-- 2. Hierarchy helpers (internal schema — not exposed via PostgREST)
-- ---------------------------------------------------------------------------
-- True when `ancestor` transitively invited `descendant` through invited_by.
create or replace function internal.is_admin_ancestor(ancestor uuid, descendant uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  with recursive chain as (
    select id, invited_by
      from public.profiles
     where id = descendant
    union all
    select p.id, p.invited_by
      from public.profiles p
      join chain c on p.id = c.invited_by
  )
  select exists (select 1 from chain where invited_by = ancestor);
$$;

-- True when the current user (must be an admin) may manage `target`:
-- never self; any admin may manage non-admins; only ancestors manage admins.
create or replace function internal.can_manage_user(target uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select
    internal.current_user_role() = 'admin'
    and target <> (select auth.uid())
    and (
      coalesce((select role from public.profiles where id = target), 'student') <> 'admin'
      or internal.is_admin_ancestor((select auth.uid()), target)
    );
$$;

grant execute on function internal.is_admin_ancestor(uuid, uuid) to authenticated;
grant execute on function internal.can_manage_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Tighten profiles UPDATE: hierarchy-scoped for admin targets
-- ---------------------------------------------------------------------------
-- Replaces "profiles are updatable by owner or admin". USING gates which rows
-- an admin may touch based on the target's CURRENT role (so managing an admin
-- requires subtree membership); WITH CHECK only requires the writer to be the
-- owner or an admin, leaving role transitions to the escalation trigger below.
drop policy "profiles are updatable by owner or admin" on public.profiles;
create policy "profiles are updatable by owner or manager"
  on public.profiles for update
  to authenticated
  using (
    id = (select auth.uid())
    or internal.can_manage_user(id)
  )
  with check (
    id = (select auth.uid())
    or internal.current_user_role() = 'admin'
  );

-- ---------------------------------------------------------------------------
-- 4. Hard-delete RPC (no service-role key needed in the app)
-- ---------------------------------------------------------------------------
-- Authorizes via can_manage_user, then deletes the auth user. ON DELETE CASCADE
-- from profiles/bookings/waitlist_entries removes all of the user's data.
-- SECURITY DEFINER so it can reach auth.users; the internal authz check makes
-- the exposed RPC safe. Executable only by authenticated (not anon).
create or replace function public.delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not internal.can_manage_user(target) then
    raise exception 'Not authorized to delete this user.'
      using errcode = '42501';
  end if;

  delete from auth.users where id = target;
end;
$$;

revoke all on function public.delete_user(uuid) from public, anon;
grant execute on function public.delete_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Allow the service role to set roles (email-invite flow)
-- ---------------------------------------------------------------------------
-- The email-invite path creates the auth user with the service role and then
-- stamps role='admin' + invited_by on the profile. auth.uid() is null for
-- service-role calls, so without this the trigger would silently revert that
-- role change. Only server-side code holding the service-role key acts as
-- service_role, so this opens no client-facing escalation path.
create or replace function internal.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role <> old.role
     and auth.role() <> 'service_role'
     and not exists (
       select 1 from public.profiles p
       where p.id = (select auth.uid()) and p.role = 'admin'
     )
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;
