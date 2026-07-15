-- Instructionals: pre-recorded technique videos a gym uploads and sells
-- individually (separate from live classes / their replays, which stay
-- bundled into membership on the `sessions` table).

create table public.modules (
  id                uuid primary key default uuid_generate_v4(),
  gym_id            uuid not null references public.gyms(id) on delete cascade,
  coach_id          uuid references public.coaches(id) on delete set null,
  title             text not null,
  description       text,
  discipline        text not null,
  level             text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  price_paise       integer not null check (price_paise > 0),
  status            text not null default 'uploading' check (status in ('uploading', 'processing', 'ready', 'failed')),
  cf_video_uid      text,
  duration_seconds  integer,
  transcript        text,
  ai_summary        text,
  ai_techniques     text[],
  ai_key_moments    jsonb,
  sales_count       integer not null default 0,
  created_at        timestamptz not null default now()
);

create index modules_gym_id_idx on public.modules(gym_id);
create index modules_status_idx on public.modules(status);
create index modules_cf_video_uid_idx on public.modules(cf_video_uid);

-- One row per purchase attempt, created at order time so a Razorpay webhook
-- has something to look up by order id rather than reconstructing the sale.
create table public.module_purchases (
  id                   uuid primary key default uuid_generate_v4(),
  module_id            uuid not null references public.modules(id) on delete cascade,
  user_id              uuid not null references public.users(id) on delete cascade,
  gym_id               uuid not null references public.gyms(id) on delete cascade,
  amount_paise         integer not null,
  platform_cut_paise   integer not null,
  gym_cut_paise        integer not null,
  razorpay_order_id    text not null unique,
  razorpay_payment_id  text unique,
  status               text not null default 'created' check (status in ('created', 'paid', 'failed')),
  payout_id            uuid references public.payouts(id) on delete set null,
  created_at           timestamptz not null default now()
);

create index module_purchases_gym_id_idx on public.module_purchases(gym_id);
create index module_purchases_module_id_idx on public.module_purchases(module_id);
create index module_purchases_user_id_idx on public.module_purchases(user_id);
-- Only one *paid* purchase per (user, module) — a failed/abandoned attempt
-- shouldn't block a retry.
create unique index module_purchases_user_module_paid_idx
  on public.module_purchases(user_id, module_id) where status = 'paid';

-- Public-safe columns only — no transcript/cf_video_uid/ai_* pre-purchase.
-- Full rows are only ever read server-side via the service-role client,
-- after an explicit module_purchases ownership check in app code (same
-- pattern already used for replay_url/transcript on `sessions`).
create view public.modules_public as
  select m.id, m.gym_id, m.coach_id, m.title, m.description, m.discipline, m.level,
         m.price_paise, m.status, m.cf_video_uid as thumbnail_uid, m.duration_seconds,
         m.sales_count, m.created_at
  from public.modules m
  join public.gyms g on g.id = m.gym_id
  where g.status = 'active' and m.status in ('processing', 'ready');

alter table public.modules enable row level security;
alter table public.module_purchases enable row level security;

-- No public select policy on modules itself — the browse UI reads
-- modules_public; the gym owner manages (and reads) their own full rows.
create policy "modules_manage_owner" on public.modules for all using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.owner_id = auth.uid())
);

-- No insert/update policy for authenticated users — all writes to
-- module_purchases go through service-role API routes (create-order,
-- razorpay webhook), same as `coupons`.
create policy "module_purchases_select_own" on public.module_purchases for select using (auth.uid() = user_id);
create policy "module_purchases_select_gym_owner" on public.module_purchases for select using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.owner_id = auth.uid())
);
