-- 005: Lock down self-updates on public.users
-- The users_update_own RLS policy allows updating ANY column, including
-- role — which would let a member promote themselves to admin now that
-- authorization reads public.users.role. Column-level grants restrict
-- self-service updates to profile fields only; role changes require the
-- service role key.

revoke update on table public.users from authenticated, anon;
grant update (name, phone) on table public.users to authenticated;
