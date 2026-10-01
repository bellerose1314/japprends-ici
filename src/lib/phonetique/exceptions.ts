import type { PhonemeId } from "./phonemes";

/**
 * EXCEPTIONS — découpage imposé pour un mot précis.
 *
 * Quand les règles générales se trompent, il suffit d'écrire ici la bonne
 * découpe du mot. C'est l'endroit le plus simple pour corriger le système.
 *
 * Format : "mot": [ ["graphie", "son"], ... ]
 * La concaténation des graphies doit redonner exactement le mot.
 */
export const EXCEPTIONS: Record<string, Array<[string, PhonemeId]>> = {
  femme: [
    ["f", "f"],
    ["e", "a"],
    ["mm", "m"],
    ["e", "muet"],
  ],
  monsieur: [
    ["m", "m"],
    ["on", "on"],
    ["s", "s"],
    ["ieu", "eu"],
    ["r", "muet"],
  ],
  fils: [
    ["f", "f"],
    ["i", "i"],
    ["l", "muet"],
    ["s", "s"],
  ],
  oignon: [
    ["oi", "o"],
    ["gn", "gn"],
    ["on", "on"],
  ],
  second: [
    ["s", "s"],
    ["e", "e_muet_son"],
    ["c", "g"],
    ["on", "on"],
    ["d", "muet"],
  ],
};
