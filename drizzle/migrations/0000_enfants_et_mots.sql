-- Un compte (parent ou enseignant) peut suivre plusieurs enfants;
-- chaque enfant a sa propre liste de mots.
create table public.enfants (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  prenom text not null,
  created_at timestamptz not null default now()
);

create table public.mots (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  enfant_id uuid not null references public.enfants(id) on delete cascade,
  mot text not null,
  created_at timestamptz not null default now(),
  unique (enfant_id, mot)
);

create index mots_enfant_idx on public.mots (enfant_id, created_at);

grant select, insert, update, delete on public.enfants to authenticated;
grant all on public.enfants to service_role;
grant select, insert, update, delete on public.mots to authenticated;
grant all on public.mots to service_role;

alter table public.enfants enable row level security;
alter table public.mots enable row level security;

create policy "Un parent gere ses enfants"
  on public.enfants
  for all
  to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

create policy "Un parent gere les mots de ses enfants"
  on public.mots
  for all
  to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());