-- replay_url is read/written across the webhook and replay pages but was
-- never added by a tracked migration — add it now so it's guaranteed to exist.
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS replay_url TEXT;
