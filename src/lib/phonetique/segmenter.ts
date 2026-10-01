import { EXCEPTIONS } from "./exceptions";
import { PHONEMES, couleurDuSon, type Phoneme, type PhonemeId } from "./phonemes";
import { REGLES, type Contexte, type Regle } from "./regles";

export interface Graphene {
  /** Les lettres écrites qui forment ce son (ex. "eau"). */
  graphie: string;
  /** Le son correspondant. */
  phoneme: Phoneme;
  /** Couleur CSS à appliquer au bloc. */
  couleur: string;
  /** Position de la première lettre dans le mot. */
  debut: number;
  /** Position après la dernière lettre. */
  fin: number;
}

export interface MotAnalyse {
  /** Le mot tel que saisi, nettoyé et en minuscules. */
  mot: string;
  graphemes: Graphene[];
  /** Vrai si le découpage vient de la liste d'exceptions. */
  exception: boolean;
}

/** Règles triées : les graphies les plus longues sont testées en premier. */
const REGLES_TRIEES: Regle[] = [...REGLES].sort(
  (a, b) => b.graphie.length - a.graphie.length,
);

export function nettoyerMot(saisie: string): string {
  return saisie
    .toLowerCase()
    .trim()
    .replace(/[^a-zàâäçéèêëîïôöùûüœ' -]/g, "");
}

function construire(
  mot: string,
  paires: Array<[string, PhonemeId]>,
  exception: boolean,
): MotAnalyse {
  let curseur = 0;
  const graphemes = paires.map(([graphie, son]) => {
    const g: Graphene = {
      graphie,
      phoneme: PHONEMES[son],
      couleur: couleurDuSon(son),
      debut: curseur,
      fin: curseur + graphie.length,
    };
    curseur += graphie.length;
    return g;
  });
  return { mot, graphemes, exception };
}

/**
 * Découpe un mot en graphèmes (les lettres qui travaillent ensemble
 * pour former un même son restent groupées).
 */
export function analyserMot(saisie: string): MotAnalyse {
  const mot = nettoyerMot(saisie);
  if (!mot) return { mot: "", graphemes: [], exception: false };

  const exception = EXCEPTIONS[mot];
  if (exception) return construire(mot, exception, true);

  const paires: Array<[string, PhonemeId]> = [];
  let i = 0;

  while (i < mot.length) {
    const lettre = mot[i] ?? "";

    // Espaces, tirets et apostrophes : on les garde tels quels, sans son.
    if (lettre === " " || lettre === "-" || lettre === "'") {
      paires.push([lettre, "muet"]);
      i += 1;
      continue;
    }

    const regle = REGLES_TRIEES.find((r) => {
      if (!mot.startsWith(r.graphie, i)) return false;
      if (!r.si) return true;
      const contexte: Contexte = {
        mot,
        index: i,
        avant: i > 0 ? (mot[i - 1] ?? "") : "",
        apres: mot[i + r.graphie.length] ?? "",
        finDeMot: i + r.graphie.length >= mot.length,
        debutDeMot: i === 0,
      };
      return r.si(contexte);
    });

    if (regle) {
      paires.push([regle.graphie, regle.son]);
      i += regle.graphie.length;
    } else {
      // Lettre inconnue : on ne devine pas, on la marque comme muette.
      paires.push([lettre, "muet"]);
      i += 1;
    }
  }

  return construire(mot, paires, false);
}

/**
 * Positions des coupures entre les sons (utilisé par l'activité
 * « À toi de séparer »). Ex. chapeau → [2, 3, 4].
 */
export function coupuresAttendues(analyse: MotAnalyse): number[] {
  return analyse.graphemes.slice(0, -1).map((g) => g.fin);
}
