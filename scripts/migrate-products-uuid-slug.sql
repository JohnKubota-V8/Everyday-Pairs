create extension if not exists pgcrypto;

alter table public.products
  add column if not exists slug text;

update public.products
set slug = lower(category || '-' || id::text)
where slug is null;

alter table public.products
  alter column slug set not null;

create unique index if not exists products_slug_key on public.products (slug);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'id'
      and data_type <> 'uuid'
  ) then
    alter table public.products add column id_uuid uuid;

    update public.products
    set id_uuid = gen_random_uuid()
    where id_uuid is null;

    alter table public.products drop constraint if exists products_pkey;
    alter table public.products drop column id;
    alter table public.products rename column id_uuid to id;
    alter table public.products alter column id set default gen_random_uuid();
    alter table public.products alter column id set not null;
    alter table public.products add constraint products_pkey primary key (id);
  end if;
end
$$;
