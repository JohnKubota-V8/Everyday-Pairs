alter table public.products
  add column if not exists bg_color text,
  add column if not exists sock_color text;
