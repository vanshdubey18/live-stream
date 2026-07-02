-- Coach verification of AI-suggested techniques.
-- verified_at/verified_by = the label a coach confirmed was actually taught —
-- this is the ground-truth signal for any future model training.
-- An unconfirmed technique that a coach removes is just deleted from
-- session_techniques (implicit "wrong" signal, no need to keep the row).

alter table public.session_techniques
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.users(id) on delete set null;
