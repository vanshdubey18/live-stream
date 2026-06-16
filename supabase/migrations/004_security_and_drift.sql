-- 004: Security hardening + schema drift documentation
-- Run against the live database via Supabase SQL editor.

-- 1. Coupon codes should not be enumerable by any authenticated user.
--    All coupon validation goes through service-role API routes
--    (join-gym, renew-access, admin/coupons), so no client read is needed.
drop policy if exists "coupons_select_active" on public.coupons;

-- 2. Document drift: live DB already has plan_type on memberships
--    (added manually, not in schema.sql). No-op if present.
alter table public.memberships
  add column if not exists plan_type text default 'full_mma';

-- 3. Mux webhook race fix: track which Mux asset belongs to which session
--    so video.asset.ready can match deterministically instead of guessing
--    by "newest ended session for this gym".
alter table public.sessions
  add column if not exists mux_asset_id text;

create index if not exists sessions_mux_asset_id_idx
  on public.sessions (mux_asset_id)
  where mux_asset_id is not null;
