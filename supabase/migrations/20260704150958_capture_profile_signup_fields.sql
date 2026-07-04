-- Extend the signup trigger to persist student_id and phone captured into
-- raw_user_meta_data at registration. Role is intentionally NOT read from
-- metadata — it stays defaulted to 'student' and remains guarded by
-- internal.prevent_role_self_escalation().
create or replace function internal.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, student_id, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    nullif(new.raw_user_meta_data ->> 'student_id', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$;
