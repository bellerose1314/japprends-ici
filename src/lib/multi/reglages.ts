import { useCallback, useEffect, useState } from "react";

/**
 * Réglages de l'espace enseignant.
 * Conservés localement sur l'appareil (aucun compte, aucune base de données).
 */

export type NomActivite =
  | "manipule"
  | "represente"
  | "comprends"
  | "pratique"
  | "addition"
  | "soustraction"
  | "division";

/** Signe de l'opération, conservé dans le journal des réussites. */
export type Operation = "x" | "+" | "-" | ":";

export type Reglages = {
  tables: number[];
  maxFacteur: number;
  activites: Record<NomActivite, boolean>;
  /** Somme maximale dans « j'additionne » et « je soustrais ». */
  maxSomme: number;
  additionRepetee: boolean;
  audio: boolean;
  chrono: boolean;
};

export const REGLAGES_DEFAUT: Reglages = {
  tables: [2, 3, 4, 5],
  maxFacteur: 10,
  activites: {
    manipule: true,
    represente: true,
    comprends: true,
    pratique: true,
    addition: true,
    soustraction: true,
    division: true,
  },
  maxSomme: 20,
  additionRepetee: true,
  audio: true,
  chrono: false, // toujours désactivé par défaut
};

const CLE = "multiplication-reglages-v1";

export function lireReglages(): Reglages {
  if (typeof window === "undefined") return REGLAGES_DEFAUT;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return REGLAGES_DEFAUT;
    const objet = JSON.parse(brut) as Partial<Reglages>;
    return {
      ...REGLAGES_DEFAUT,
      ...objet,
      activites: { ...REGLAGES_DEFAUT.activites, ...(objet.activites ?? {}) },
      tables:
        Array.isArray(objet.tables) && objet.tables.length > 0
          ? objet.tables.filter((n) => Number.isInteger(n) && n >= 1 && n <= 10)
          : REGLAGES_DEFAUT.tables,
    };
  } catch {
    return REGLAGES_DEFAUT;
  }
}

export function ecrireReglages(reglages: Reglages): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(reglages));
  } catch {
    /* espace de stockage indisponible : on continue sans sauvegarder */
  }
}

/** Charge les réglages après l'affichage (évite toute différence serveur/navigateur). */
export function useReglages(): [Reglages, (maj: Partial<Reglages>) => void, boolean] {
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DEFAUT);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    setReglages(lireReglages());
    setCharge(true);
  }, []);

  const modifier = useCallback((maj: Partial<Reglages>) => {
    setReglages((ancien) => {
      const nouveau = { ...ancien, ...maj };
      ecrireReglages(nouveau);
      return nouveau;
    });
  }, []);

  return [reglages, modifier, charge];
}

function hasard(min: number, max: number): number {
  return min + Math.floor(Math.random() * Math.max(1, max - min + 1));
}

/** Tire au hasard une multiplication « a groupes de b » selon les réglages. */
export function tirerMultiplication(reglages: Reglages): { a: number; b: number } {
  const tables = reglages.tables.length > 0 ? reglages.tables : REGLAGES_DEFAUT.tables;
  const a = tables[Math.floor(Math.random() * tables.length)] ?? 3;
  const b = 1 + Math.floor(Math.random() * Math.max(1, reglages.maxFacteur));
  return { a, b };
}

/** Tire une addition a + b, avec une somme qui reste sous le maximum choisi. */
export function tirerAddition(reglages: Reglages): { a: number; b: number } {
  const max = Math.max(2, reglages.maxSomme);
  // On garde chaque nombre raisonnable : jusqu'à 10 jetons par collection.
  const a = hasard(1, Math.min(10, Math.max(1, max - 1)));
  const b = hasard(1, Math.min(10, Math.max(1, max - a)));
  return { a, b };
}

/** Tire une soustraction a − b (b jetons enlevés sur a). */
export function tirerSoustraction(reglages: Reglages): { a: number; b: number } {
  const max = Math.max(2, reglages.maxSomme);
  const a = hasard(2, max);
  const b = hasard(1, a);
  return { a, b };
}

/** Tire un partage : a jetons partagés également entre b groupes. */
export function tirerDivision(reglages: Reglages): { a: number; b: number } {
  const tables = reglages.tables.filter((n) => n >= 2);
  const liste = tables.length > 0 ? tables : [2, 3, 4, 5];
  const b = liste[Math.floor(Math.random() * liste.length)] ?? 3;
  const parGroupe = hasard(1, Math.max(1, Math.min(reglages.maxFacteur, 10)));
  return { a: b * parGroupe, b };
}
