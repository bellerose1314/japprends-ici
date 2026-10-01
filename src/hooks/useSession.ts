import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/** Session de l'utilisateur, côté navigateur uniquement (jamais pendant le SSR). */
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!actif) return;
      setUser(data.session?.user ?? null);
      setChargement(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!actif) return;
      setUser(session?.user ?? null);
      setChargement(false);
    });

    return () => {
      actif = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, chargement };
}
