/**
 * Table des PHONÈMES (les sons du français).
 *
 * Chaque son possède :
 *  - un identifiant stable (utilisé partout dans le code)
 *  - une étiquette lisible pour l'élève / l'enseignant
 *  - une couleur, définie dans src/styles.css sous la forme --son-<id>
 *
 * Pour changer une couleur : modifier la variable correspondante dans
 * src/styles.css. Aucun autre fichier à toucher.
 *
 * Deux graphies différentes qui produisent le même son (o / au / eau)
 * pointent vers le MÊME phonème et partagent donc automatiquement la couleur.
 */

export type PhonemeId =
  | "a"
  | "e_ferme"
  | "e_ouvert"
  | "e_muet_son"
  | "i"
  | "o"
  | "ou"
  | "u"
  | "eu"
  | "an"
  | "on"
  | "in"
  | "un"
  | "wa"
  | "ui"
  | "ien"
  | "p"
  | "b"
  | "t"
  | "d"
  | "k"
  | "g"
  | "f"
  | "v"
  | "s"
  | "z"
  | "ch"
  | "j"
  | "m"
  | "n"
  | "gn"
  | "l"
  | "r"
  | "y"
  | "muet";

export interface Phoneme {
  id: PhonemeId;
  /** Notation du son, affichée à l'enseignant. */
  son: string;
  /** Mot repère simple pour l'élève. */
  repere: string;
  /** Type de son, utile pour l'affichage et les futurs filtres. */
  type: "voyelle" | "consonne" | "muet";
}

export const PHONEMES: Record<PhonemeId, Phoneme> = {
  a: { id: "a", son: "a", repere: "chat", type: "voyelle" },
  e_ferme: { id: "e_ferme", son: "é", repere: "bébé", type: "voyelle" },
  e_ouvert: { id: "e_ouvert", son: "è", repere: "mère", type: "voyelle" },
  e_muet_son: { id: "e_muet_son", son: "e", repere: "petit", type: "voyelle" },
  i: { id: "i", son: "i", repere: "lit", type: "voyelle" },
  o: { id: "o", son: "o", repere: "bateau", type: "voyelle" },
  ou: { id: "ou", son: "ou", repere: "mouton", type: "voyelle" },
  u: { id: "u", son: "u", repere: "lune", type: "voyelle" },
  eu: { id: "eu", son: "eu", repere: "fleur", type: "voyelle" },
  an: { id: "an", son: "an", repere: "chanson", type: "voyelle" },
  on: { id: "on", son: "on", repere: "maison", type: "voyelle" },
  in: { id: "in", son: "in", repere: "lapin", type: "voyelle" },
  un: { id: "un", son: "un", repere: "brun", type: "voyelle" },
  wa: { id: "wa", son: "oi", repere: "voiture", type: "voyelle" },
  ui: { id: "ui", son: "ui", repere: "nuit", type: "voyelle" },
  ien: { id: "ien", son: "ien", repere: "chien", type: "voyelle" },

  p: { id: "p", son: "p", repere: "papa", type: "consonne" },
  b: { id: "b", son: "b", repere: "bateau", type: "consonne" },
  t: { id: "t", son: "t", repere: "tomate", type: "consonne" },
  d: { id: "d", son: "d", repere: "dodo", type: "consonne" },
  k: { id: "k", son: "k", repere: "cacao", type: "consonne" },
  g: { id: "g", son: "g", repere: "gâteau", type: "consonne" },
  f: { id: "f", son: "f", repere: "photo", type: "consonne" },
  v: { id: "v", son: "v", repere: "vélo", type: "consonne" },
  s: { id: "s", son: "s", repere: "souris", type: "consonne" },
  z: { id: "z", son: "z", repere: "maison", type: "consonne" },
  ch: { id: "ch", son: "ch", repere: "chapeau", type: "consonne" },
  j: { id: "j", son: "j", repere: "jupe", type: "consonne" },
  m: { id: "m", son: "m", repere: "maman", type: "consonne" },
  n: { id: "n", son: "n", repere: "nid", type: "consonne" },
  gn: { id: "gn", son: "gn", repere: "champignon", type: "consonne" },
  l: { id: "l", son: "l", repere: "lune", type: "consonne" },
  r: { id: "r", son: "r", repere: "rat", type: "consonne" },
  y: { id: "y", son: "y", repere: "yoyo", type: "consonne" },

  muet: { id: "muet", son: "—", repere: "lettre muette", type: "muet" },
};

/** Couleur CSS du son (définie dans src/styles.css). */
export function couleurDuSon(id: PhonemeId): string {
  return `var(--son-${id})`;
}
