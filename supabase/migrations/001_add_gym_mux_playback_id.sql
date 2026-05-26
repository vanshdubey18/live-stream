-- Add mux_playback_id to gyms table (stores the live stream playback ID from Mux)
alter table public.gyms add column if not exists mux_playback_id text;
