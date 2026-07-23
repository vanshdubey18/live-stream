-- Minimal fixed-window rate limiter backed by Postgres — no Redis/Upstash
-- dependency needed for the volumes this app runs at today. One row per
-- (bucket key), reset when its window has elapsed.
create table public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer not null default 1
);

-- Writes only ever go through the service-role client from route handlers.
alter table public.rate_limits enable row level security;

-- Atomic sales_count increment — the webhook previously did a
-- read-then-write (select sales_count, update sales_count+1), which loses
-- counts under genuinely concurrent purchases of the same module (two
-- different buyers, not just a webhook redelivery). A single UPDATE
-- statement is race-free regardless of concurrency.
create or replace function public.increment_module_sales(p_module_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.modules set sales_count = sales_count + 1 where id = p_module_id;
$$;
