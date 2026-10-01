import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

import {
  chargerProgresNuage,
  definirEnfantActif,
  enfantActifId,
} from "@/lib/multi/progres";

export type Enfant = { id: string; prenom: string };

/** Les enfants du parent connecté (liste gérée dans « Mes mots »). */
export function useEnfants(user: User | null) {
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [chargement, setChargement] = useState(false);
  const [maj, setMaj] = useState(0);

  useEffect(() => {
    if (!user) {
      setEnfants([]);
      return;
    }
    let actif = true;
    setChargement(true);
    supabase
      .from("enfants")
      .select("id, prenom")
      .order("created_at")
      .then(({ data }) => {
        if (!actif) return;
        setEnfants((data as Enfant[] | null) ?? []);
        setChargement(false);
      });
    return () => {
      actif = false;
    };
  }, [user, maj]);

  const rafraichir = useCallback(() => setMaj((n) => n + 1), []);

  return { enfants, chargement, rafraichir };
}

/** Session élève : quel enfant joue, avec sa progression sauvegardée. */
export function useSessionEnfant() {
  const { user, chargement } = useSession();
  const { enfants, chargement: chargementEnfants, rafraichir } = useEnfants(user);
  const [actif, setActif] = useState<string | null>(null);

  useEffect(() => {
    setActif(enfantActifId());
  }, []);

  const choisir = useCallback(async (id: string | null) => {
    setActif(id);
    definirEnfantActif(id);
    if (id) await chargerProgresNuage(id);
  }, []);

  return { user, chargement: chargement || chargementEnfants, enfants, actif, choisir, rafraichir };
}
