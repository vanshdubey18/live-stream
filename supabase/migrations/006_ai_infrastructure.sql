-- 006: AI infrastructure — session intelligence + technique knowledge graph

-- ── New columns on sessions ──────────────────────────────────────────────────
alter table public.sessions
  add column if not exists ai_key_moments jsonb;
-- ai_key_moments stores: { techniques:[{name,timestamp}], moments:[{timestamp,label}], coachQuote:string }

-- ── Technique knowledge graph ─────────────────────────────────────────────────

create table if not exists public.techniques (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null unique,
  discipline     text not null,
  canonical_slug text unique,
  typical_level  text,
  session_count  integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.session_techniques (
  session_id        uuid not null references public.sessions(id) on delete cascade,
  technique_id      uuid not null references public.techniques(id) on delete cascade,
  timestamp_seconds integer,
  primary key (session_id, technique_id)
);

create table if not exists public.technique_sequences (
  from_technique      uuid not null references public.techniques(id) on delete cascade,
  to_technique        uuid not null references public.techniques(id) on delete cascade,
  co_occurrence_count integer not null default 1,
  sequence_count      integer not null default 1,
  primary key (from_technique, to_technique)
);

-- ── Member skill graph ────────────────────────────────────────────────────────

create table if not exists public.member_technique_exposure (
  user_id        uuid not null references public.users(id) on delete cascade,
  technique_id   uuid not null references public.techniques(id) on delete cascade,
  exposure_count integer not null default 1,
  last_seen_at   timestamptz not null default now(),
  rewatch_count  integer not null default 0,
  primary key (user_id, technique_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.techniques enable row level security;
alter table public.session_techniques enable row level security;
alter table public.technique_sequences enable row level security;
alter table public.member_technique_exposure enable row level security;

-- Techniques are read-only for authenticated users; writes go through service role
create policy "techniques_read" on public.techniques for select to authenticated using (true);

-- Session techniques: readable if user has access to the gym (simplified: any authenticated)
create policy "session_techniques_read" on public.session_techniques for select to authenticated using (true);

-- Technique sequences: read-only for authenticated
create policy "technique_sequences_read" on public.technique_sequences for select to authenticated using (true);

-- Member exposure: each user sees only their own
create policy "member_exposure_own" on public.member_technique_exposure for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
