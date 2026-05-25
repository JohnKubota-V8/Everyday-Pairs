create table if not exists public.app_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.app_settings
  enable row level security;

drop policy if exists "deny_all_app_settings" on public.app_settings;
create policy "deny_all_app_settings"
on public.app_settings
for all
to anon, authenticated
using (false)
with check (false);

insert into public.app_settings (key, value)
values ('customer_knowledge', '')
on conflict (key) do nothing;
