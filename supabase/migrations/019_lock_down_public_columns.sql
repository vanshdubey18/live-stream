-- CRITICAL SECURITY FIX: gyms_select_active / sessions_select_public only
-- check gym.status = 'active' — they say nothing about who's asking. Since
-- Postgres RLS policies are OR'd together, that alone exposed every column
-- of every active gym/session to anyone holding the public anon key,
-- regardless of membership or ownership: stream_key, cf_whip_url,
-- razorpay_account_id, transcript, replay_url, cf_video_uid — the entire
-- membership paywall was bypassable via a direct PostgREST call.
--
-- Fix: column-level grants are role-wide (not conditional on which RLS
-- policy matched), so instead of trying to make RLS itself column-aware,
-- we cap what the anon/authenticated Postgres role can ever select on
-- these two tables to a safe whitelist. Every legitimate read of the
-- columns being locked down here already happens (or is migrated in this
-- same change) through the service-role client after an explicit
-- app-level ownership/membership check — the same pattern already used
-- for `modules`/`module_purchases`.

revoke select on public.gyms from anon, authenticated;
grant select (
  id, slug, name, description, location, city, disciplines,
  logo_url, cover_url, instagram, owner_id, monthly_price_paise,
  status, created_at
) on public.gyms to anon, authenticated;

revoke select on public.sessions from anon, authenticated;
grant select (
  id, gym_id, coach_id, title, discipline, scheduled_at,
  duration_minutes, level, status, mux_playback_id, viewer_count,
  created_at
) on public.sessions to anon, authenticated;

-- modules_public claimed to exclude cf_video_uid pre-purchase but actually
-- selected it (aliased as thumbnail_uid) — the real Cloudflare video UID
-- was readable by anyone before purchase, enabling direct playback without
-- paying. Recreate without it; thumbnails should come from a stored
-- poster/thumbnail asset, not the source video UID.
drop view if exists public.modules_public;
create view public.modules_public as
  select m.id, m.gym_id, m.coach_id, m.title, m.description, m.discipline, m.level,
         m.price_paise, m.status, m.duration_seconds,
         m.sales_count, m.created_at
  from public.modules m
  join public.gyms g on g.id = m.gym_id
  where g.status = 'active' and m.status in ('processing', 'ready');
