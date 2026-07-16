-- Lets the gym owner pin one message per session to the top of live chat
-- (e.g. "Focus: kimura from mount") — mirrors the "pinned message" pattern
-- from Twitch/YouTube live chat.
ALTER TABLE public.live_chat_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS live_chat_messages_pinned_idx ON public.live_chat_messages(session_id) WHERE is_pinned;
