CREATE TABLE IF NOT EXISTS public.live_chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_name is denormalized at insert time — Realtime postgres_changes payloads
-- carry only the raw row, no joins, so a name lookup per incoming message would
-- otherwise be needed just to render the sender.
CREATE INDEX IF NOT EXISTS live_chat_messages_session_id_created_at_idx ON public.live_chat_messages(session_id, created_at);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Active members of the session's gym, or the gym's owner, can read messages
CREATE POLICY live_chat_select ON public.live_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.memberships m ON m.gym_id = s.gym_id
      WHERE s.id = live_chat_messages.session_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.id = live_chat_messages.session_id
        AND g.owner_id = auth.uid()
    )
  );

-- Gym owner can delete any message in their own session (moderation)
CREATE POLICY live_chat_owner_delete ON public.live_chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.id = live_chat_messages.session_id
        AND g.owner_id = auth.uid()
    )
  );

-- Writes go through /api/live-chat (service role, with its own membership/owner
-- check) rather than direct client inserts, matching the rest of the codebase —
-- no client-side insert policy is needed.

-- Push new/deleted messages over Realtime instead of falling back to polling
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_chat_messages'
  ) then
    alter publication supabase_realtime add table public.live_chat_messages;
  end if;
end $$;
