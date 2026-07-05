-- Addresses Supabase advisor findings: lock down handle_new_user() RPC surface,
-- stop RLS policies from re-evaluating auth.uid() per row, and index FKs used
-- in ownership-check policies/joins.

-- 1. handle_new_user() is a SECURITY DEFINER trigger function; it should only
-- ever run via the auth.users trigger, not be directly callable over PostgREST.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. Wrap auth.uid() in a scalar subselect so Postgres evaluates it once per
-- statement instead of once per row (auth_rls_initplan advisor finding).
alter policy "users_select_own" on public.users
  using (id = (select auth.uid()));
alter policy "users_update_own" on public.users
  using (id = (select auth.uid()));

alter policy "gyms_select_own" on public.gyms
  using (owner_id = (select auth.uid()));
alter policy "gyms_update_own" on public.gyms
  using (owner_id = (select auth.uid()));
alter policy "gyms_insert_owner" on public.gyms
  with check (owner_id = (select auth.uid()));

alter policy "coaches_manage_owner" on public.coaches
  using (exists (select 1 from public.gyms g where g.id = coaches.gym_id and g.owner_id = (select auth.uid())));

alter policy "sessions_manage_owner" on public.sessions
  using (exists (select 1 from public.gyms g where g.id = sessions.gym_id and g.owner_id = (select auth.uid())));

alter policy "memberships_select_own" on public.memberships
  using (user_id = (select auth.uid()));
alter policy "memberships_insert_own" on public.memberships
  with check (user_id = (select auth.uid()));

alter policy "watch_history_own" on public.watch_history
  using (user_id = (select auth.uid()));

alter policy "coupon_redemptions_own" on public.coupon_redemptions
  using (user_id = (select auth.uid()));

alter policy "payouts_select_owner" on public.payouts
  using (exists (select 1 from public.gyms g where g.id = payouts.gym_id and g.owner_id = (select auth.uid())));

alter policy "member_exposure_own" on public.member_technique_exposure
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 3. Index foreign keys used by the ownership-check policies above and by
-- normal join/lookup queries (unindexed_foreign_keys advisor finding).
create index if not exists gyms_owner_id_idx on public.gyms (owner_id);
create index if not exists coaches_gym_id_idx on public.coaches (gym_id);
create index if not exists sessions_coach_id_idx on public.sessions (coach_id);
create index if not exists sessions_gym_id_idx on public.sessions (gym_id);
create index if not exists memberships_gym_id_idx on public.memberships (gym_id);
create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists coupon_redemptions_coupon_id_idx on public.coupon_redemptions (coupon_id);
create index if not exists coupon_redemptions_gym_id_idx on public.coupon_redemptions (gym_id);
create index if not exists coupon_redemptions_user_id_idx on public.coupon_redemptions (user_id);
create index if not exists watch_history_session_id_idx on public.watch_history (session_id);
create index if not exists watch_history_user_id_idx on public.watch_history (user_id);
create index if not exists payouts_gym_id_idx on public.payouts (gym_id);
create index if not exists session_techniques_technique_id_idx on public.session_techniques (technique_id);
create index if not exists session_techniques_verified_by_idx on public.session_techniques (verified_by);
create index if not exists technique_sequences_to_technique_idx on public.technique_sequences (to_technique);
create index if not exists member_technique_exposure_technique_id_idx on public.member_technique_exposure (technique_id);
