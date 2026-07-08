CREATE TABLE IF NOT EXISTS public.announcements (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id     UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS announcements_gym_id_created_at_idx ON public.announcements(gym_id, created_at DESC);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Gym owners manage announcements for their own gym
CREATE POLICY announcements_gym_owner_write ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gyms g
      WHERE g.id = announcements.gym_id
        AND g.owner_id = auth.uid()
    )
  );

-- Active members can read announcements from gyms they belong to
CREATE POLICY announcements_member_select ON public.announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.gym_id = announcements.gym_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );
