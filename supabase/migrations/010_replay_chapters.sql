CREATE TABLE IF NOT EXISTS public.replay_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  timestamp_seconds INT NOT NULL,
  label TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS replay_chapters_session_id_idx ON public.replay_chapters(session_id);

ALTER TABLE public.replay_chapters ENABLE ROW LEVEL SECURITY;

-- Gym owners can write chapters for their own sessions
CREATE POLICY chapters_gym_owner_write ON public.replay_chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.id = replay_chapters.session_id
        AND g.owner_id = auth.uid()
    )
  );

-- Active members can read chapters for sessions in their gym
CREATE POLICY chapters_member_select ON public.replay_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.sessions s ON s.gym_id = m.gym_id
      WHERE s.id = replay_chapters.session_id
        AND m.user_id = auth.uid()
        AND (m.current_period_end > NOW() OR m.free_until > NOW())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.id = replay_chapters.session_id
        AND g.owner_id = auth.uid()
    )
  );
