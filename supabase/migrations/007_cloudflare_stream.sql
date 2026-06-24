-- Add Cloudflare Stream columns to gyms
ALTER TABLE gyms
  ADD COLUMN IF NOT EXISTS cf_live_input_uid text,
  ADD COLUMN IF NOT EXISTS cf_whip_url        text,
  ADD COLUMN IF NOT EXISTS cf_hls_url         text;

-- Add cf_hls_url to sessions (for live playback URL at time of session creation)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS cf_hls_url text;
