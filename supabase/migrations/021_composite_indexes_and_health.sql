-- Composite indexes matching the actual hot-path query patterns in
-- src/lib/supabase/queries.ts — the existing single-column indexes (004,
-- 013) force a filter step Postgres can't push into the index scan for
-- these specific multi-condition + order-by queries.

-- getUpcomingSessions/getRecentReplays/getReplayLibrary all filter
-- gym_id + status, then order by scheduled_at.
create index if not exists sessions_gym_status_scheduled_idx
  on public.sessions(gym_id, status, scheduled_at);

-- getMembershipForGym / session-status membership checks filter all three
-- together.
create index if not exists memberships_user_gym_status_idx
  on public.memberships(user_id, gym_id, status);

-- getAllActiveGyms filters status, orders by created_at — was a seq scan.
create index if not exists gyms_status_created_idx
  on public.gyms(status, created_at desc);
