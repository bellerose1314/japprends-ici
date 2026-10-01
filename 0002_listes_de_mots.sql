CREATE TABLE public.listes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  enfant_id uuid NOT NULL REFERENCES public.enfants(id) ON DELETE CASCADE,
  nom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listes TO authenticated;
GRANT ALL ON public.listes TO service_role;
ALTER TABLE public.listes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Un parent gere les listes de ses enfants" ON public.listes FOR ALL TO authenticated USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());
CREATE INDEX listes_enfant_idx ON public.listes(enfant_id);
ALTER TABLE public.mots ADD COLUMN liste_id uuid REFERENCES public.listes(id) ON DELETE SET NULL;
CREATE INDEX mots_liste_idx ON public.mots(liste_id);