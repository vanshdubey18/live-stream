insert into storage.buckets (id, name, public)
values
  ('gym-assets', 'gym-assets', true),
  ('coach-avatars', 'coach-avatars', true)
on conflict (id) do nothing;
