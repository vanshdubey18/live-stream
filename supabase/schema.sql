-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text unique not null,
  name       text not null,
  phone      text,
  role       text not null default 'member' check (role in ('member', 'gym_owner', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Gyms ─────────────────────────────────────────────────────────────────────
create table public.gyms (
  id                   uuid primary key default uuid_generate_v4(),
  slug                 text unique not null,
  name                 text not null,
  description          text,
  location             text,
  city                 text,
  disciplines          text[] not null default '{}',
  logo_url             text,
  cover_url            text,
  owner_email          text not null,
  owner_id             uuid references public.users(id) on delete set null,
  stream_key           text,
  mux_live_stream_id   text,
  monthly_price_paise  integer not null default 99900,
  status               text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  razorpay_account_id  text,
  created_at           timestamptz not null default now()
);

-- ─── Coaches ──────────────────────────────────────────────────────────────────
create table public.coaches (
  id         uuid primary key default uuid_generate_v4(),
  gym_id     uuid not null references public.gyms(id) on delete cascade,
  name       text not null,
  discipline text not null,
  bio        text,
  belt_rank  text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ─── Sessions ─────────────────────────────────────────────────────────────────
create table public.sessions (
  id                uuid primary key default uuid_generate_v4(),
  gym_id            uuid not null references public.gyms(id) on delete cascade,
  coach_id          uuid references public.coaches(id) on delete set null,
  title             text not null,
  discipline        text not null,
  scheduled_at      timestamptz not null,
  duration_minutes  integer not null default 60,
  level             text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  status            text not null default 'scheduled' check (status in ('scheduled', 'live', 'ended')),
  mux_playback_id   text,
  replay_url        text,
  transcript        text,
  ai_summary        text,
  ai_techniques     text[],
  viewer_count      integer not null default 0,
  created_at        timestamptz not null default now()
);

-- ─── Memberships ──────────────────────────────────────────────────────────────
create table public.memberships (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  gym_id                   uuid not null references public.gyms(id) on delete cascade,
  price_charged_paise      integer,
  status                   text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  razorpay_subscription_id text,
  source                   text not null default 'paid' check (source in ('paid', 'coupon')),
  free_until               timestamptz,
  current_period_end       timestamptz,
  created_at               timestamptz not null default now()
);

-- ─── Coupons ──────────────────────────────────────────────────────────────────
create table public.coupons (
  id         uuid primary key default uuid_generate_v4(),
  code       text unique not null,
  type       text not null check (type in ('free_days', 'percent_off')),
  value      integer not null,
  plan_type  text not null default 'all',
  max_uses   integer not null default 100,
  times_used integer not null default 0,
  expires_at timestamptz,
  is_active  boolean not null default true,
  notes      text,
  created_at timestamptz not null default now()
);

-- ─── Coupon Redemptions ───────────────────────────────────────────────────────
create table public.coupon_redemptions (
  id                 uuid primary key default uuid_generate_v4(),
  coupon_id          uuid not null references public.coupons(id) on delete cascade,
  user_id            uuid not null references public.users(id) on delete cascade,
  gym_id             uuid not null references public.gyms(id) on delete cascade,
  plan_type          text not null,
  free_until         timestamptz not null,
  redeemed_at        timestamptz not null default now(),
  converted_to_paid  boolean not null default false
);

-- ─── Watch History ────────────────────────────────────────────────────────────
create table public.watch_history (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  session_id       uuid not null references public.sessions(id) on delete cascade,
  watched_at       timestamptz not null default now(),
  duration_seconds integer not null default 0
);

-- ─── Payouts ──────────────────────────────────────────────────────────────────
create table public.payouts (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references public.gyms(id) on delete cascade,
  amount_paise  integer not null,
  period_start  date not null,
  period_end    date not null,
  status        text not null default 'pending' check (status in ('pending', 'paid')),
  created_at    timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.gyms enable row level security;
alter table public.coaches enable row level security;
alter table public.sessions enable row level security;
alter table public.memberships enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.watch_history enable row level security;
alter table public.payouts enable row level security;

-- Users: read/update own row only
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- Gyms: public can read active; owners manage their own; admin sees all
create policy "gyms_select_active" on public.gyms for select using (status = 'active');
create policy "gyms_select_own"    on public.gyms for select using (auth.uid() = owner_id);
create policy "gyms_update_own"    on public.gyms for update using (auth.uid() = owner_id);
create policy "gyms_insert_owner"  on public.gyms for insert with check (auth.uid() = owner_id);

-- Coaches: public read on active gym coaches; gym owner manages
create policy "coaches_select_public" on public.coaches for select using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.status = 'active')
);
create policy "coaches_manage_owner" on public.coaches for all using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.owner_id = auth.uid())
);

-- Sessions: public read on active gym sessions; gym owner manages
create policy "sessions_select_public" on public.sessions for select using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.status = 'active')
);
create policy "sessions_manage_owner" on public.sessions for all using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.owner_id = auth.uid())
);

-- Memberships: members see their own
create policy "memberships_select_own" on public.memberships for select using (auth.uid() = user_id);
create policy "memberships_insert_own" on public.memberships for insert with check (auth.uid() = user_id);

-- Watch history: own rows only
create policy "watch_history_own" on public.watch_history for all using (auth.uid() = user_id);

-- Coupons: authenticated users can read active coupons
create policy "coupons_select_active" on public.coupons for select using (is_active = true and auth.uid() is not null);

-- Coupon redemptions: own rows only
create policy "coupon_redemptions_own" on public.coupon_redemptions for all using (auth.uid() = user_id);

-- Payouts: gym owner can see their payouts
create policy "payouts_select_owner" on public.payouts for select using (
  exists (select 1 from public.gyms g where g.id = gym_id and g.owner_id = auth.uid())
);
