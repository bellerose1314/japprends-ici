/**
 * Données du module « Je pratique les verbes ».
 * Pour ajouter un verbe : ajouter une entrée dans VERBES.
 * Pour ajouter un temps : l'activer dans TEMPS et remplir `conjugaisons[temps]` des verbes.
 * Les verbes irréguliers ont leurs formes écrites explicitement (pas de radical).
 */

export type TempsId = "present" | "imparfait" | "futur" | "conditionnel" | "passe-compose";

export const TEMPS: Array<{ id: TempsId; nom: string; actif: boolean }> = [
  { id: "present", nom: "présent de l'indicatif", actif: true },
  { id: "imparfait", nom: "imparfait", actif: true },
  { id: "futur", nom: "futur simple", actif: true },
  { id: "passe-compose", nom: "passé composé", actif: true },
  { id: "conditionnel", nom: "conditionnel présent", actif: true },
];

/** Index : 0 je, 1 tu, 2 il/elle, 3 nous, 4 vous, 5 ils/elles */
export const PRONOMS = ["je", "tu", "il / elle", "nous", "vous", "ils / elles"] as const;

export type Formes = [string, string, string, string, string, string];

export type Exemple = { sujet: string; personne: number; suite: string };

export type Verbe = {
  infinitif: string;
  groupe: 1 | 2 | 3;
  /** Radical, seulement si les formes se construisent radical + terminaison. */
  radical?: string;
  conjugaisons: Partial<Record<TempsId, Formes>>;
  exemples: Exemple[];
  /** Exemples de variété : rend les phrases de « je complète » toutes différentes. */
  plus?: Exemple[];
};

const imp = (r: string): Formes => [r + "ais", r + "ais", r + "ait", r + "ions", r + "iez", r + "aient"];
const fut = (r: string): Formes => [r + "ai", r + "as", r + "a", r + "ons", r + "ez", r + "ont"];
const AUX_AVOIR = ["ai", "as", "a", "avons", "avez", "ont"];
const AUX_ETRE = ["suis", "es", "est", "sommes", "êtes", "sont"];
const pcAvoir = (pp: string): Formes => AUX_AVOIR.map((a) => `${a} ${pp}`) as Formes;
const pcEtre = (pp: string): Formes => AUX_ETRE.map((a, i) => `${a} ${pp}${i >= 3 ? "s" : ""}`) as Formes;

/** Construit les 5 temps à partir du présent, du radical d'imparfait, du radical de futur et du passé composé. */
function temps(present: Formes, rImp: string | Formes, rFut: string, pc: Formes): Partial<Record<TempsId, Formes>> {
  return {
    present,
    imparfait: typeof rImp === "string" ? imp(rImp) : rImp,
    futur: fut(rFut),
    conditionnel: imp(rFut),
    "passe-compose": pc,
  };
}

const ex = (...l: Array<[string, number, string]>): Exemple[] => l.map(([sujet, personne, suite]) => ({ sujet, personne, suite }));

export const VERBES: Verbe[] = [
  {
    infinitif: "être",
    groupe: 3,
    conjugaisons: temps(["suis", "es", "est", "sommes", "êtes", "sont"], "ét", "ser", pcAvoir("été")),
    exemples: ex(["je", 0, "content."], ["nous", 3, "à l'école."], ["tu", 1, "très gentil."], ["Léa", 2, "dans la cour."], ["Les chats", 5, "fatigués."], ["Toi et Paul", 4, "amis."]),
    plus: ex(["je", 0, "prêt."], ["je", 0, "en retard."], ["tu", 1, "malade."], ["tu", 1, "à la maison."]),
  },
  {
    infinitif: "avoir",
    groupe: 3,
    conjugaisons: temps(["ai", "as", "a", "avons", "avez", "ont"], "av", "aur", pcAvoir("eu")),
    exemples: ex(["je", 0, "un chien."], ["vous", 4, "faim."], ["ils", 5, "un ballon."], ["Thomas", 2, "un vélo."], ["Ma sœur et moi", 3, "un chat."], ["Les enfants", 5, "des crayons."]),
    plus: ex(["je", 0, "sommeil."], ["je", 0, "six ans."], ["tu", 1, "un vélo."], ["tu", 1, "des crayons."]),
  },
  {
    infinitif: "aimer",
    groupe: 1,
    radical: "aim",
    conjugaisons: temps(["aime", "aimes", "aime", "aimons", "aimez", "aiment"], "aim", "aimer", pcAvoir("aimé")),
    exemples: ex(["nous", 3, "les animaux."], ["tu", 1, "le chocolat."], ["elle", 2, "la musique."], ["Emma et Zoé", 5, "danser."], ["Mon frère", 2, "les pommes."], ["Toi et ton frère", 4, "lire."]),
    plus: ex(["je", 0, "les pommes."], ["je", 0, "la musique."], ["tu", 1, "les animaux."], ["tu", 1, "danser."]),
  },
  {
    infinitif: "aller",
    groupe: 3,
    conjugaisons: temps(["vais", "vas", "va", "allons", "allez", "vont"], "all", "ir", pcEtre("allé")),
    exemples: ex(["je", 0, "à la piscine."], ["nous", 3, "au parc."], ["ils", 5, "à l'école."], ["Léa", 2, "chez sa mamie."], ["Les enfants", 5, "dans la cour."], ["Mon ami et moi", 3, "au cinéma."]),
    plus: ex(["je", 0, "au parc."], ["je", 0, "au cinéma."], ["tu", 1, "à la piscine."], ["tu", 1, "chez ta mamie."]),
  },
  {
    infinitif: "faire",
    groupe: 3,
    conjugaisons: temps(["fais", "fais", "fait", "faisons", "faites", "font"], "fais", "fer", pcAvoir("fait")),
    exemples: ex(["tu", 1, "un dessin."], ["vous", 4, "du vélo."], ["il", 2, "un gâteau."], ["Papa", 2, "la cuisine."], ["Les élèves", 5, "leurs devoirs."], ["Ma sœur et moi", 3, "un château."]),
    plus: ex(["je", 0, "un gâteau."], ["je", 0, "la cuisine."], ["tu", 1, "un dessin."], ["tu", 1, "du vélo."]),
  },
  {
    infinitif: "finir",
    groupe: 2,
    radical: "fin",
    conjugaisons: temps(["finis", "finis", "finit", "finissons", "finissez", "finissent"], "finiss", "finir", pcAvoir("fini")),
    exemples: ex(["je", 0, "mon repas."], ["nous", 3, "le livre."], ["elles", 5, "le puzzle."], ["Thomas", 2, "son travail."], ["Toi et Léa", 4, "la course."], ["Les enfants", 5, "leur dessin."]),
    plus: ex(["je", 0, "le livre."], ["je", 0, "mon dessin."], ["tu", 1, "ton repas."], ["tu", 1, "le puzzle."]),
  },
  {
    infinitif: "chanter",
    groupe: 1,
    radical: "chant",
    conjugaisons: temps(["chante", "chantes", "chante", "chantons", "chantez", "chantent"], "chant", "chanter", pcAvoir("chanté")),
    exemples: ex(["nous", 3, "une chanson."], ["je", 0, "fort."], ["vous", 4, "bien."], ["Les oiseaux", 5, "le matin."], ["Zoé", 2, "sous la douche."], ["Mon frère et moi", 3, "ensemble."]),
    plus: ex(["je", 0, "une chanson."], ["je", 0, "bien."], ["tu", 1, "fort."], ["tu", 1, "sous la douche."]),
  },
  {
    infinitif: "jouer",
    groupe: 1,
    radical: "jou",
    conjugaisons: temps(["joue", "joues", "joue", "jouons", "jouez", "jouent"], "jou", "jouer", pcAvoir("joué")),
    exemples: ex(["tu", 1, "au ballon."], ["ils", 5, "dehors."], ["nous", 3, "aux cartes."], ["Les enfants", 5, "dans la cour."], ["Léa", 2, "du piano."], ["Toi et ton frère", 4, "au soccer."]),
    plus: ex(["je", 0, "aux cartes."], ["je", 0, "du piano."], ["tu", 1, "au ballon."], ["tu", 1, "dehors."]),
  },
  {
    infinitif: "parler",
    groupe: 1,
    radical: "parl",
    conjugaisons: temps(["parle", "parles", "parle", "parlons", "parlez", "parlent"], "parl", "parler", pcAvoir("parlé")),
    exemples: ex(["je", 0, "à mon ami."], ["tu", 1, "doucement."], ["nous", 3, "français."], ["Mamie", 2, "au téléphone."], ["Les élèves", 5, "de leur voyage."], ["Toi et Léa", 4, "fort."]),
    plus: ex(["je", 0, "français."], ["je", 0, "au téléphone."], ["tu", 1, "à ton ami."], ["tu", 1, "fort."]),
  },
  {
    infinitif: "manger",
    groupe: 1,
    radical: "mang",
    conjugaisons: temps(
      ["mange", "manges", "mange", "mangeons", "mangez", "mangent"],
      ["mangeais", "mangeais", "mangeait", "mangions", "mangiez", "mangeaient"],
      "manger",
      pcAvoir("mangé"),
    ),
    exemples: ex(["je", 0, "une pomme."], ["nous", 3, "à la cantine."], ["tu", 1, "des pâtes."], ["Le chat", 2, "ses croquettes."], ["Les enfants", 5, "une collation."], ["Toi et ton frère", 4, "des crêpes."]),
    plus: ex(["je", 0, "un biscuit."], ["je", 0, "des frites."], ["tu", 1, "une collation."], ["tu", 1, "à la cantine."]),
  },
  {
    infinitif: "prendre",
    groupe: 3,
    conjugaisons: temps(["prends", "prends", "prend", "prenons", "prenez", "prennent"], "pren", "prendr", pcAvoir("pris")),
    exemples: ex(["je", 0, "l'autobus."], ["tu", 1, "ton sac."], ["nous", 3, "le train."], ["Léa", 2, "un crayon."], ["Les enfants", 5, "leur manteau."], ["Toi et Paul", 4, "une photo."]),
    plus: ex(["je", 0, "le train."], ["je", 0, "un crayon."], ["tu", 1, "l'autobus."], ["tu", 1, "ton manteau."]),
  },
  {
    infinitif: "venir",
    groupe: 3,
    conjugaisons: temps(["viens", "viens", "vient", "venons", "venez", "viennent"], "ven", "viendr", pcEtre("venu")),
    exemples: ex(["je", 0, "à la fête."], ["tu", 1, "avec moi."], ["nous", 3, "du parc."], ["Papi", 2, "dimanche."], ["Mes cousins", 5, "à la maison."], ["Toi et ta sœur", 4, "ce soir."]),
    plus: ex(["je", 0, "du parc."], ["je", 0, "à la maison."], ["tu", 1, "à la fête."], ["tu", 1, "ce soir."]),
  },
  {
    infinitif: "pouvoir",
    groupe: 3,
    conjugaisons: temps(["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"], "pouv", "pourr", pcAvoir("pu")),
    exemples: ex(["je", 0, "courir vite."], ["tu", 1, "entrer."], ["nous", 3, "jouer dehors."], ["Thomas", 2, "nager."], ["Les oiseaux", 5, "voler."], ["Toi et Zoé", 4, "venir."]),
    plus: ex(["je", 0, "nager."], ["je", 0, "voler."], ["tu", 1, "courir vite."], ["tu", 1, "jouer dehors."]),
  },
  {
    infinitif: "vouloir",
    groupe: 3,
    conjugaisons: temps(["veux", "veux", "veut", "voulons", "voulez", "veulent"], "voul", "voudr", pcAvoir("voulu")),
    exemples: ex(["je", 0, "un biscuit."], ["tu", 1, "jouer."], ["nous", 3, "un chien."], ["Emma", 2, "dessiner."], ["Les enfants", 5, "sortir."], ["Toi et ton ami", 4, "du jus."]),
    plus: ex(["je", 0, "un chien."], ["je", 0, "dessiner."], ["tu", 1, "un biscuit."], ["tu", 1, "du jus."]),
  },
  {
    infinitif: "dire",
    groupe: 3,
    conjugaisons: temps(["dis", "dis", "dit", "disons", "dites", "disent"], "dis", "dir", pcAvoir("dit")),
    exemples: ex(["je", 0, "bonjour."], ["tu", 1, "merci."], ["nous", 3, "la vérité."], ["Maman", 2, "bravo."], ["Les élèves", 5, "au revoir."], ["Toi et Léa", 4, "un secret."]),
    plus: ex(["je", 0, "merci."], ["je", 0, "au revoir."], ["tu", 1, "bonjour."], ["tu", 1, "la vérité."]),
  },
  {
    infinitif: "voir",
    groupe: 3,
    conjugaisons: temps(["vois", "vois", "voit", "voyons", "voyez", "voient"], "voy", "verr", pcAvoir("vu")),
    exemples: ex(["je", 0, "la mer."], ["tu", 1, "un oiseau."], ["nous", 3, "la lune."], ["Léa", 2, "son amie."], ["Les enfants", 5, "un arc-en-ciel."], ["Toi et Paul", 4, "le film."]),
    plus: ex(["je", 0, "la lune."], ["je", 0, "un arc-en-ciel."], ["tu", 1, "la mer."], ["tu", 1, "un oiseau."]),
  },
];

/** Groupes sujets pour « Je trouve le pronom ». Au moins 20 entrées : la série
 *  de 20 questions n'affiche ainsi jamais deux fois le même groupe. */
export const GROUPES_SUJETS: Array<{ groupe: string; personne: number; pronom: string; raison: string }> = [
  { groupe: "Ma sœur et moi", personne: 3, pronom: "nous", raison: "ma sœur + moi = nous" },
  { groupe: "Thomas", personne: 2, pronom: "il", raison: "Thomas = un garçon = il" },
  { groupe: "Léa", personne: 2, pronom: "elle", raison: "Léa = une fille = elle" },
  { groupe: "Les enfants", personne: 5, pronom: "ils", raison: "les enfants = plusieurs = ils" },
  { groupe: "Emma et Zoé", personne: 5, pronom: "elles", raison: "Emma + Zoé = deux filles = elles" },
  { groupe: "Mon frère et moi", personne: 3, pronom: "nous", raison: "mon frère + moi = nous" },
  { groupe: "Toi et ton frère", personne: 4, pronom: "vous", raison: "toi + ton frère = vous" },
  { groupe: "Le chat", personne: 2, pronom: "il", raison: "le chat = un seul = il" },
  { groupe: "Les filles", personne: 5, pronom: "elles", raison: "les filles = plusieurs filles = elles" },
  { groupe: "Toi et moi", personne: 3, pronom: "nous", raison: "toi + moi = nous" },
  { groupe: "Moi", personne: 0, pronom: "je", raison: "moi, c'est moi = je" },
  { groupe: "Mon chien", personne: 2, pronom: "il", raison: "mon chien = un seul = il" },
  { groupe: "Ma mamie", personne: 2, pronom: "elle", raison: "ma mamie = une personne = elle" },
  { groupe: "Les garçons", personne: 5, pronom: "ils", raison: "les garçons = plusieurs = ils" },
  { groupe: "Toi et ta sœur", personne: 4, pronom: "vous", raison: "toi + ta sœur = vous" },
  { groupe: "Papa et maman", personne: 5, pronom: "ils", raison: "papa + maman = ils" },
  { groupe: "Mon ami et moi", personne: 3, pronom: "nous", raison: "mon ami + moi = nous" },
  { groupe: "Le maître", personne: 2, pronom: "il", raison: "le maître = une personne = il" },
  { groupe: "Ma voisine", personne: 2, pronom: "elle", raison: "ma voisine = une personne = elle" },
  { groupe: "Toi et Léa", personne: 4, pronom: "vous", raison: "toi + Léa = vous" },
  { groupe: "Les oiseaux", personne: 5, pronom: "ils", raison: "les oiseaux = plusieurs = ils" },
  { groupe: "Toi et ton ami", personne: 4, pronom: "vous", raison: "toi + ton ami = vous" },
];

/** Sujets de variété pour « je complète » (personnes il/elle, nous, vous, ils/elles). */
export const SUJETS_PAR_PERSONNE: Record<number, string[]> = {
  2: ["Thomas", "Léa", "Le chat", "Ma mamie", "Mon chien", "Papa", "Le maître", "Ma voisine"],
  3: ["Ma sœur et moi", "Mon frère et moi", "Toi et moi", "Mon ami et moi"],
  4: ["Toi et ton frère", "Toi et Léa", "Toi et ta sœur", "Toi et ton ami"],
  5: ["Les enfants", "Les filles", "Emma et Zoé", "Papa et maman", "Les oiseaux", "Les garçons"],
};

export const PRONOMS_SIMPLES = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"];

export function trouverVerbe(infinitif: string): Verbe | undefined {
  return VERBES.find((v) => v.infinitif === infinitif);
}

export function formes(verbe: Verbe, temps: TempsId): Formes | undefined {
  return verbe.conjugaisons[temps];
}

/** Terminaison de l'infinitif (er, ir, re, oir) si le verbe a un radical. */
export function terminaisonInfinitif(verbe: Verbe): string {
  return verbe.radical ? verbe.infinitif.slice(verbe.radical.length) : "";
}

/** Découpe une forme en radical + terminaison quand c'est possible. */
export function decouper(verbe: Verbe, forme: string): { radical: string; fin: string } | null {
  if (!verbe.radical || !forme.startsWith(verbe.radical)) return null;
  return { radical: verbe.radical, fin: forme.slice(verbe.radical.length) };
}

/** « je » devient « j' » devant une voyelle ou un h. */
export function avecPronom(pronom: string, forme: string): string {
  if (pronom.toLowerCase() === "je" && /^[aeéèêiouyh]/i.test(forme)) return `j'${forme}`;
  return `${pronom} ${forme}`;
}

/** Pronom simple d'affichage pour une personne (il/elle au hasard). */
export function pronomPour(personne: number): string {
  const choix = [["je"], ["tu"], ["il", "elle"], ["nous"], ["vous"], ["ils", "elles"]][personne] ?? ["je"];
  return choix[Math.floor(Math.random() * choix.length)] ?? "je";
}

export function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j] as T, copie[i] as T];
  }
  return copie;
}

export function auHasard<T>(liste: T[]): T {
  return liste[Math.floor(Math.random() * liste.length)] as T;
}

export function estPronom(sujet: string): boolean {
  return PRONOMS_SIMPLES.includes(sujet.toLowerCase());
}
