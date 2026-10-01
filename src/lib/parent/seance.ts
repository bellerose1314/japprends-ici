import { useCallback, useEffect, useState } from "react";

/**
 * Espace parent : choix de la séance et suivi des notions.
 * Tout reste sur l'appareil. Le format « Programme » pourra plus tard venir
 * d'un enseignant (liste de notions partagée) sans changer les activités.
 */

export type Matiere = "vocabulaire" | "multiplication" | "verbes";
export type Aide = 1 | 2 | 3; // 1 beaucoup d'aide, 2 un peu, 3 autonome
export type Duree = 5 | 10 | 15;

export type Programme = {
  matiere: Matiere;
  verbes: string[];
  tables: number[];
  aide: Aide;
  duree: Duree;
};

export const PROGRAMME_DEFAUT: Programme = {
  matiere: "verbes",
  verbes: ["être", "avoir"],
  tables: [2, 5],
  aide: 1,
  duree: 10,
};

/** Environ un exercice par minute : aucun chronomètre n'est affiché. */
export function nombreExercices(d: Duree): number {
  return d;
}

const CLE_PROG = "parent-programme-v1";

export function lireProgramme(): Programme {
  try {
    const o = JSON.parse(window.localStorage.getItem(CLE_PROG) ?? "null") as Partial<Programme> | null;
    return { ...PROGRAMME_DEFAUT, ...(o ?? {}) };
  } catch {
    return PROGRAMME_DEFAUT;
  }
}

export function useProgramme(): [Programme, (maj: Partial<Programme>) => void, boolean] {
  const [p, setP] = useState(PROGRAMME_DEFAUT);
  const [charge, setCharge] = useState(false);
  useEffect(() => {
    setP(lireProgramme());
    setCharge(true);
  }, []);
  const modifier = useCallback((maj: Partial<Programme>) => {
    setP((a) => {
      const n = { ...a, ...maj };
      try {
        window.localStorage.setItem(CLE_PROG, JSON.stringify(n));
      } catch {
        /* rien */
      }
      return n;
    });
  }, []);
  return [p, modifier, charge];
}

/* ---------- maîtrise des notions ---------- */

type Reponse = { ok: boolean; jour: string };
const CLE_MAITRISE = "parent-maitrise-v1";

function lireTout(): Record<string, Reponse[]> {
  try {
    return JSON.parse(window.localStorage.getItem(CLE_MAITRISE) ?? "{}") as Record<string, Reponse[]>;
  } catch {
    return {};
  }
}

/** Enregistre une réponse (première tentative) pour une notion, ex. « verbe:être:present ». */
export function noterReponse(notion: string, ok: boolean): void {
  const tout = lireTout();
  const liste = [...(tout[notion] ?? []), { ok, jour: new Date().toISOString().slice(0, 10) }].slice(-40);
  tout[notion] = liste;
  try {
    window.localStorage.setItem(CLE_MAITRISE, JSON.stringify(tout));
  } catch {
    /* rien */
  }
}

export type Etat = "apprentissage" | "progresse" | "maitrise";

/**
 * Jamais une seule réponse : il faut au moins 8 réponses sur 2 jours différents
 * pour « bien maîtrisé », et 4 réponses pour « ça progresse ».
 */
export function etatNotion(liste: Reponse[]): Etat {
  const recentes = liste.slice(-12);
  const reussite = recentes.filter((r) => r.ok).length / Math.max(1, recentes.length);
  const jours = new Set(liste.map((r) => r.jour)).size;
  if (liste.length >= 8 && jours >= 2 && reussite >= 0.8) return "maitrise";
  if (liste.length >= 4 && reussite >= 0.5) return "progresse";
  return "apprentissage";
}

export const LIBELLE_ETAT: Record<Etat, string> = {
  apprentissage: "🌱 En apprentissage",
  progresse: "🌿 Ça progresse",
  maitrise: "⭐ Bien maîtrisé",
};

export function nomNotion(notion: string): string {
  const [type, a] = notion.split(":");
  if (type === "verbe") return `Verbe « ${a} » au présent`;
  if (type === "table") return `Multiplications ×${a}`;
  if (type === "mot") return `Mot « ${a} »`;
  return notion;
}

export function lireProgres(): Array<{ notion: string; etat: Etat }> {
  return Object.entries(lireTout()).map(([notion, liste]) => ({ notion, etat: etatNotion(liste) }));
}
