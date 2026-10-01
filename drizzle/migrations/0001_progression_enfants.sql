create table public.progression (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null,
  enfant_id uuid not null unique references public.enfants(id) on delete cascade,
  etoiles integer not null default 0,
  journal jsonb not null default '[]'::jsonb,
  parcours jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now()
);

grant select, insert, update, delete on public.progression to authenticated;
grant all on public.progression to service_role;

alter table public.progression enable row level security;

create policy "Un parent gere la progression de ses enfants"
  on public.progression
  for all
  to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());