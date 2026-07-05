-- sessions.status changes (live -> ended, scheduled -> live) were never pushed over
-- Supabase Realtime because the table was never added to the supabase_realtime
-- publication. Every client (member watch page, member dashboard, gym dashboard)
-- subscribes to postgres_changes on this table expecting instant updates, but was
-- silently falling back to 30s polling the whole time.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
end $$;
