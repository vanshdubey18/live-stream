-- Cloudflare recording fields on sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS cf_video_uid TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS duration_seconds INT;

-- Auto-clip fields on sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS clip_video_uid TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS clip_url TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS clip_status TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS clip_banner_dismissed BOOLEAN NOT NULL DEFAULT FALSE;
