-- Декларативная схема постоянного хранения заказов RAKURS.
-- Применяется владельцем в SQL Editor проекта Supabase до включения переменных
-- окружения на проде. Браузеру права на эти таблицы не выдаются.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  request_id uuid not null unique,
  source text not null check (source in ('web', 'telegram', 'admin', 'manual')),
  status text not null default 'received' check (status in ('received', 'production', 'ready', 'delivery', 'pickup', 'done', 'cancelled')),
  locale text not null check (locale in ('ka', 'ru')),
  customer_name text,
  customer_phone text not null,
  customer_email text,
  customer_comment text,
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  configuration jsonb not null,
  pricing jsonb not null,
  is_estimate boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((delivery_method = 'delivery' and delivery_address is not null) or delivery_method = 'pickup')
);

create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete restrict,
  status text not null check (status in ('received', 'production', 'ready', 'delivery', 'pickup', 'done', 'cancelled')),
  changed_by text not null default 'system',
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_created_at_idx
  on public.order_status_history (order_id, created_at);

create or replace function public.record_initial_order_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.order_status_history (order_id, status)
  values (new.id, new.status);
  return new;
end;
$$;

drop trigger if exists orders_initial_status on public.orders;
create trigger orders_initial_status
  after insert on public.orders
  for each row execute function public.record_initial_order_status();

alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;

revoke all on table public.orders, public.order_status_history from anon, authenticated;
revoke all on sequence public.orders_order_number_seq, public.order_status_history_id_seq from anon, authenticated;
