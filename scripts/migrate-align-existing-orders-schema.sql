do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_phone'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'phone'
  ) then
    alter table public.orders rename column customer_phone to phone;
  end if;
end $$;

alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists note text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists subtotal numeric(12,2);
alter table public.orders add column if not exists items jsonb;
alter table public.orders add column if not exists updated_at timestamptz;

update public.orders
set
  customer_name = coalesce(customer_name, ''),
  phone = coalesce(phone, ''),
  address = coalesce(address, ''),
  note = coalesce(note, ''),
  payment_method = coalesce(payment_method, 'promptpay'),
  subtotal = coalesce(subtotal, greatest(coalesce(total, 0) - coalesce(shipping_fee, 0), 0)),
  items = coalesce(items, '[]'::jsonb),
  status = coalesce(status, 'pending'),
  updated_at = coalesce(updated_at, now());

alter table public.orders alter column customer_name set not null;
alter table public.orders alter column phone set not null;
alter table public.orders alter column address set not null;
alter table public.orders alter column note set not null;
alter table public.orders alter column note set default '';
alter table public.orders alter column payment_method set not null;
alter table public.orders alter column payment_method set default 'promptpay';
alter table public.orders alter column subtotal set not null;
alter table public.orders alter column subtotal set default 0;
alter table public.orders alter column shipping_fee set not null;
alter table public.orders alter column shipping_fee set default 0;
alter table public.orders alter column total set not null;
alter table public.orders alter column total set default 0;
alter table public.orders alter column items set not null;
alter table public.orders alter column items set default '[]'::jsonb;
alter table public.orders alter column status set not null;
alter table public.orders alter column status set default 'pending';
alter table public.orders alter column updated_at set not null;
alter table public.orders alter column updated_at set default now();

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_user_id_idx on public.orders (user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));
  end if;
end $$;

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert on public.orders to authenticated;
