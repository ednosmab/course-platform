-- Auto-confirm new auth users (dev only - remove in production)
create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  update auth.users
  set email_confirmed_at = now(),
      confirmed_at = now(),
      raw_app_meta_data = raw_app_meta_data || '{"email_confirmed": true}'::jsonb
  where id = new.id;
  return new;
end;
$$;

create trigger tr_auto_confirm_user
  after insert on auth.users
  for each row
  execute procedure public.auto_confirm_user();
