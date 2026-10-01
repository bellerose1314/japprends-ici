import { useCallback, useEffect, useState } from "react";

import type { TempsId } from "@/lib/verbes/donnees";

/** Réglages du module verbes, conservés sur l'appareil (comme les autres réglages). */

export type ActiviteVerbe = "construis" | "associe" | "complete" | "pronom" | "repere" | "pratique";
export type Niveau = 1 | 2 | 3;

export type ReglagesVerbes = {
  verbes: string[];
  temps: TempsId[];
  activites: Record<ActiviteVerbe, boolean>;
  niveau: Niveau;
};

export const REGLAGES_VERBES_DEFAUT: ReglagesVerbes = {
  verbes: ["être", "avoir", "aimer", "aller", "faire", "finir", "chanter", "jouer", "parler", "manger", "prendre", "venir", "pouvoir", "vouloir", "dire", "voir"],
  temps: ["present", "imparfait", "futur", "passe-compose", "conditionnel"],
  activites: {
    construis: true,
    associe: true,
    complete: true,
    pronom: true,
    repere: true,
    pratique: true,
  },
  niveau: 1,
};

const CLE = "verbes-reglages-v2";
const ANCIENNE_CLE = "verbes-reglages-v1";
const NOUVEAUX_VERBES = ["parler", "manger", "prendre", "venir", "pouvoir", "vouloir", "dire", "voir"];

function lire(): ReglagesVerbes {
  try {
    let brut = window.localStorage.getItem(CLE);
    let ancien = false;
    if (!brut) {
      brut = window.localStorage.getItem(ANCIENNE_CLE);
      ancien = true;
    }
    if (!brut) return REGLAGES_VERBES_DEFAUT;
    const o = JSON.parse(brut) as Partial<ReglagesVerbes>;
    if (ancien) {
      // Anciens réglages : on ouvre les nouveaux temps et les nouveaux verbes.
      o.temps = REGLAGES_VERBES_DEFAUT.temps;
      if (Array.isArray(o.verbes)) o.verbes = [...new Set([...o.verbes, ...NOUVEAUX_VERBES])];
    }
    return {
      ...REGLAGES_VERBES_DEFAUT,
      ...o,
      activites: { ...REGLAGES_VERBES_DEFAUT.activites, ...(o.activites ?? {}) },
      verbes: Array.isArray(o.verbes) && o.verbes.length > 0 ? o.verbes : REGLAGES_VERBES_DEFAUT.verbes,
      temps: Array.isArray(o.temps) && o.temps.length > 0 ? o.temps : REGLAGES_VERBES_DEFAUT.temps,
    };
  } catch {
    return REGLAGES_VERBES_DEFAUT;
  }
}

export function useReglagesVerbes(): [ReglagesVerbes, (maj: Partial<ReglagesVerbes>) => void] {
  const [r, setR] = useState<ReglagesVerbes>(REGLAGES_VERBES_DEFAUT);
  useEffect(() => setR(lire()), []);
  const modifier = useCallback((maj: Partial<ReglagesVerbes>) => {
    setR((ancien) => {
      const nouveau = { ...ancien, ...maj };
      try {
        window.localStorage.setItem(CLE, JSON.stringify(nouveau));
      } catch {
        /* stockage indisponible */
      }
      return nouveau;
    });
  }, []);
  return [r, modifier];
}
