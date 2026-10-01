import type { PhonemeId } from "./phonemes";

/**
 * RÈGLES GRAPHÈME → PHONÈME.
 *
 * ⚠️ Le français est plein d'exceptions : ces règles ne prétendent PAS
 * deviner parfaitement la prononciation d'un mot à partir de son orthographe.
 * Elles donnent une bonne première approximation, et sont faites pour être
 * corrigées et enrichies facilement.
 *
 * Deux façons de corriger le système :
 *  1. Ajuster / ajouter une règle ici (cas général).
 *  2. Ajouter le mot dans EXCEPTIONS (src/lib/phonetique/exceptions.ts).
 *
 * Les règles les plus longues sont essayées en premier (« eau » avant « au »).
 * Une règle peut poser une condition sur ce qui précède / suit.
 */

export interface Contexte {
  /** Le mot complet, en minuscules. */
  mot: string;
  /** Position du graphème dans le mot. */
  index: number;
  /** Lettre juste avant le graphème ("" au début du mot). */
  avant: string;
  /** Lettre juste après le graphème ("" à la fin du mot). */
  apres: string;
  /** Vrai si le graphème termine le mot. */
  finDeMot: boolean;
  /** Vrai si le graphème commence le mot. */
  debutDeMot: boolean;
}

export interface Regle {
  /** Suite de lettres écrites. */
  graphie: string;
  /** Son produit. */
  son: PhonemeId;
  /** Condition optionnelle d'application. */
  si?: (c: Contexte) => boolean;
  /** Note pédagogique facultative. */
  note?: string;
}

const VOYELLES = "aeiouyâàéèêëîïôöûùü";

export const estVoyelle = (lettre: string) =>
  lettre !== "" && VOYELLES.includes(lettre);

/** Une voyelle nasale ne se forme que si aucune voyelle ni n/m ne suit. */
const nasale = (c: Contexte) =>
  c.finDeMot || (!estVoyelle(c.apres) && c.apres !== "n" && c.apres !== "m");

const fin = (c: Contexte) => c.finDeMot;
const suiviDeEIY = (c: Contexte) => "eiyéèê".includes(c.apres);
const entreVoyelles = (c: Contexte) => estVoyelle(c.avant) && estVoyelle(c.apres);

export const REGLES: Regle[] = [
  // ---------- Voyelles complexes ----------
  { graphie: "eau", son: "o" },
  { graphie: "oeu", son: "eu" },
  { graphie: "œu", son: "eu" },
  { graphie: "ain", son: "in", si: nasale },
  { graphie: "aim", son: "in", si: nasale },
  { graphie: "ein", son: "in", si: nasale },
  { graphie: "eim", son: "in", si: nasale },
  { graphie: "ien", son: "ien", si: nasale },
  { graphie: "oin", son: "in", si: nasale },
  { graphie: "au", son: "o" },
  { graphie: "ai", son: "e_ouvert" },
  { graphie: "ei", son: "e_ouvert" },
  { graphie: "oi", son: "wa" },
  { graphie: "ou", son: "ou" },
  { graphie: "eu", son: "eu" },
  { graphie: "an", son: "an", si: nasale },
  { graphie: "am", son: "an", si: nasale },
  { graphie: "en", son: "an", si: nasale },
  { graphie: "em", son: "an", si: nasale },
  { graphie: "on", son: "on", si: nasale },
  { graphie: "om", son: "on", si: nasale },
  { graphie: "in", son: "in", si: nasale },
  { graphie: "im", son: "in", si: nasale },
  { graphie: "yn", son: "in", si: nasale },
  { graphie: "ym", son: "in", si: nasale },
  { graphie: "un", son: "un", si: nasale },
  { graphie: "um", son: "un", si: nasale },

  // ---------- Terminaisons fréquentes ----------
  { graphie: "er", son: "e_ferme", si: fin, note: "terminaison -er" },
  { graphie: "ez", son: "e_ferme", si: fin, note: "terminaison -ez" },
  { graphie: "et", son: "e_ouvert", si: fin, note: "terminaison -et" },

  // ---------- Consonnes complexes ----------
  { graphie: "ch", son: "ch" },
  { graphie: "ph", son: "f" },
  { graphie: "gn", son: "gn" },
  { graphie: "th", son: "t" },
  { graphie: "qu", son: "k" },
  { graphie: "gu", son: "g", si: suiviDeEIY },

  // ---------- Consonnes doubles ----------
  { graphie: "ss", son: "s" },
  { graphie: "cc", son: "k" },
  { graphie: "ll", son: "l" },
  { graphie: "mm", son: "m" },
  { graphie: "nn", son: "n" },
  { graphie: "pp", son: "p" },
  { graphie: "rr", son: "r" },
  { graphie: "tt", son: "t" },
  { graphie: "ff", son: "f" },
  { graphie: "dd", son: "d" },
  { graphie: "bb", son: "b" },

  // ---------- Lettres simples à valeur variable ----------
  { graphie: "c", son: "s", si: suiviDeEIY },
  { graphie: "c", son: "k" },
  { graphie: "ç", son: "s" },
  { graphie: "g", son: "j", si: suiviDeEIY },
  { graphie: "g", son: "g" },
  { graphie: "s", son: "z", si: entreVoyelles },
  { graphie: "s", son: "muet", si: fin, note: "s final souvent muet" },
  { graphie: "s", son: "s" },
  { graphie: "x", son: "muet", si: fin },
  { graphie: "x", son: "k" },
  { graphie: "h", son: "muet", note: "h ne s'entend pas" },

  // ---------- Consonnes finales souvent muettes ----------
  { graphie: "t", son: "muet", si: fin },
  { graphie: "d", son: "muet", si: fin },
  { graphie: "p", son: "muet", si: fin },
  { graphie: "z", son: "muet", si: fin },

  // ---------- Voyelles simples ----------
  { graphie: "é", son: "e_ferme" },
  { graphie: "è", son: "e_ouvert" },
  { graphie: "ê", son: "e_ouvert" },
  { graphie: "ë", son: "e_ouvert" },
  { graphie: "e", son: "muet", si: fin, note: "e final muet" },
  { graphie: "e", son: "e_muet_son" },
  { graphie: "a", son: "a" },
  { graphie: "â", son: "a" },
  { graphie: "à", son: "a" },
  { graphie: "i", son: "i" },
  { graphie: "î", son: "i" },
  { graphie: "ï", son: "i" },
  { graphie: "o", son: "o" },
  { graphie: "ô", son: "o" },
  { graphie: "u", son: "u" },
  { graphie: "û", son: "u" },
  { graphie: "ù", son: "u" },
  { graphie: "y", son: "i" },

  // ---------- Consonnes simples ----------
  { graphie: "b", son: "b" },
  { graphie: "d", son: "d" },
  { graphie: "f", son: "f" },
  { graphie: "j", son: "j" },
  { graphie: "k", son: "k" },
  { graphie: "l", son: "l" },
  { graphie: "m", son: "m" },
  { graphie: "n", son: "n" },
  { graphie: "p", son: "p" },
  { graphie: "r", son: "r" },
  { graphie: "t", son: "t" },
  { graphie: "v", son: "v" },
  { graphie: "w", son: "v" },
  { graphie: "z", son: "z" },
];
