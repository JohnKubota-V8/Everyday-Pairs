create extension if not exists pgcrypto;

create table if not exists public.sales_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  amount numeric(12,2) not null,
  items_count integer not null check (items_count > 0),
  source text not null default 'pos',
  created_at timestamptz not null default now()
);

create index if not exists sales_logs_created_at_idx on public.sales_logs (created_at desc);
create index if not exists sales_logs_order_id_idx on public.sales_logs (order_id);
create index if not exists sales_logs_source_idx on public.sales_logs (source);

alter table public.sales_logs enable row level security;

drop policy if exists "Admins can read sales logs" on public.sales_logs;
create policy "Admins can read sales logs"
on public.sales_logs
for select
to authenticated
using (public.is_admin());

grant select on public.sales_logs to authenticated;
