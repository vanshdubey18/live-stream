-- ─── Seed Data for testing ────────────────────────────────────────────────────
-- Run this AFTER schema.sql
-- Replace 'YOUR_USER_ID' with your actual user ID from Supabase Auth > Users

-- 1. Update your user role to admin (replace with your user ID)
-- UPDATE public.users SET role = 'admin' WHERE id = 'YOUR_USER_ID';

-- 2. Insert test gyms
INSERT INTO public.gyms (id, slug, name, description, location, city, disciplines, owner_email, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'xtreme-mma-mumbai', 'Xtreme MMA Mumbai',
   'Premier MMA gym in Mumbai offering world-class training.', 'Andheri West', 'Mumbai',
   ARRAY['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'], 'rahul@xtrememma.com', 'active'),

  ('22222222-2222-2222-2222-222222222222', 'strike-lab-boxing', 'Strike Lab Boxing',
   'Professional boxing academy with pro trainers.', 'Connaught Place', 'Delhi',
   ARRAY['Boxing'], 'arjun@strikelab.in', 'active');

-- 3. Insert coaches
INSERT INTO public.coaches (id, gym_id, name, discipline, belt_rank, bio)
VALUES
  ('aaaa1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Coach Rajan', 'BJJ', 'Black Belt', 'IBJJF champion, 10+ years competitive experience.'),

  ('aaaa1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Coach Siddhi', 'Muay Thai', 'Kru', 'Trained in Thailand for 5 years.'),

  ('aaaa1111-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'Coach Arjun', 'Boxing', 'Pro Fighter', 'Former national boxing champion.');

-- 4. Insert sessions (upcoming + ended for replays)
INSERT INTO public.sessions (id, gym_id, coach_id, title, discipline, scheduled_at, duration_minutes, level, status)
VALUES
  -- Live now
  ('sess-live-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000001',
   'Advanced BJJ — Guard Passing', 'BJJ', now(), 60, 'Advanced', 'live'),

  -- Upcoming today
  ('sess-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000002',
   'Muay Thai Clinch Work', 'Muay Thai', now() + interval '2 hours', 60, 'Intermediate', 'scheduled'),

  -- Upcoming tomorrow
  ('sess-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
   'aaaa1111-0000-0000-0000-000000000003',
   'Footwork & Combinations', 'Boxing', now() + interval '1 day', 45, 'Beginner', 'scheduled'),

  ('sess-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000001',
   'No-Gi Submission Wrestling', 'BJJ', now() + interval '2 days', 90, 'Advanced', 'scheduled'),

  -- Replays (ended)
  ('sess-rep1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000001',
   'Back Takes & RNC Finish', 'BJJ', now() - interval '1 day', 58, 'Advanced', 'ended'),

  ('sess-rep2-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   'aaaa1111-0000-0000-0000-000000000003',
   'Southpaw Pressure Fighting', 'Boxing', now() - interval '2 days', 45, 'Intermediate', 'ended'),

  ('sess-rep3-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000002',
   'Teep & Push Kick Defence', 'Muay Thai', now() - interval '3 days', 52, 'Intermediate', 'ended'),

  ('sess-rep4-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'aaaa1111-0000-0000-0000-000000000001',
   'Guard Retention Masterclass', 'BJJ', now() - interval '5 days', 60, 'Beginner', 'ended');

-- 5. Add memberships for your user (replace YOUR_USER_ID)
-- INSERT INTO public.memberships (user_id, gym_id, plan_type, disciplines, status, source)
-- VALUES
--   ('YOUR_USER_ID', '11111111-1111-1111-1111-111111111111', 'full_mma',
--    ARRAY['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'], 'active', 'coupon'),
--   ('YOUR_USER_ID', '22222222-2222-2222-2222-222222222222', 'single',
--    ARRAY['Boxing'], 'active', 'coupon');
