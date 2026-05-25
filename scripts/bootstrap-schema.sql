create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric not null,
  original_price numeric,
  category text not null,
  description text,
  material text,
  is_new boolean not null default false,
  is_featured boolean not null default false,
  bg_color text,
  sock_color text,
  stock integer not null default 0,
  sizes text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
using (true);

grant select on public.products to anon, authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Users can read their admin row" on public.admin_users;
create policy "Users can read their admin row"
on public.admin_users
for select
using (auth.uid() = user_id);

grant select on public.admin_users to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_key on public.profiles (username);
create unique index if not exists profiles_email_key on public.profiles (email);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Profiles are visible to owners and admins" on public.profiles;
create policy "Profiles are visible to owners and admins"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles can be updated by owners and admins" on public.profiles;
create policy "Profiles can be updated by owners and admins"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

grant select, update on public.profiles to authenticated;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;

drop policy if exists "Admins can read todos" on public.todos;
create policy "Admins can read todos"
on public.todos
for select
using (public.is_admin());

grant select on public.todos to authenticated;

create or replace function public.resolve_email_by_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_email text;
begin
  select p.email
    into resolved_email
  from public.profiles p
  where lower(p.username) = lower(trim(p_username))
  limit 1;

  return resolved_email;
end;
$$;

revoke all on function public.resolve_email_by_username(text) from public;
grant execute on function public.resolve_email_by_username(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'username'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'user'
    ),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
