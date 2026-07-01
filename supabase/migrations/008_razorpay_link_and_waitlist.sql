-- Add razorpay payment link to gyms
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS razorpay_link TEXT;

-- Gym owner waitlist for partner applications
CREATE TABLE IF NOT EXISTS public.gym_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  gym_name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  city TEXT NOT NULL,
  contact TEXT NOT NULL,
  submitted_ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT gym_waitlist_contact_unique UNIQUE (contact)
);

-- Only admins / service role can read waitlist submissions
ALTER TABLE public.gym_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY gym_waitlist_insert ON public.gym_waitlist
  FOR INSERT WITH CHECK (true);
