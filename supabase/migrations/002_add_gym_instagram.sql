-- Adds the Instagram handle column used by the gym profile form/API.
alter table public.gyms add column if not exists instagram text;

-- Refresh PostgREST schema cache so the new column is queryable immediately.
notify pgrst, 'reload schema';
