import { useEffect, useState } from "react";

import type { NomActivite, Operation } from "@/lib/multi/reglages";

/**
 * Progression de l'enfant : étoiles, journal des réussites, parcours du jour.
 * Sans enfant actif : tout reste sur l'appareil.
 * Avec un enfant actif (session élève) : la progression est aussi sauvegardée
 * dans Lovable Cloud, pour la retrouver sur une autre tablette ou un autre ordinateur.
 */

export type JournalEntree = {
  activite: NomActivite;
  a: number;
  b: number;
  /** Signe de l'opération ; absent pour les anciennes entrées (multiplication). */
  op?: Operation;
  ts: number;
};

const CLE_ETOILES = "multiplication-etoiles-v1";
const CLE_JOURNAL = "multiplication-journal-v1";
const CLE_PARCOURS = "multiplication-parcours-v1";
const CLE_ENFANT = "multiplication-enfant-actif-v1";
const EVENEMENT = "multiplication-progres";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENEMENT));
}

/** Enfant dont la session est ouverte (ou null : progression sur cet appareil). */
export function enfantActifId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLE_ENFANT) || null;
}

export function definirEnfantActif(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(CLE_ENFANT, id);
  else window.localStorage.removeItem(CLE_ENFANT);
  emit();
}

/* Clés locales : suffixées par enfant quand une session est ouverte. */
function cleEtoiles(): string {
  const id = enfantActifId();
  return id ? `${CLE_ETOILES}:${id}` : CLE_ETOILES;
}
function cleJournal(): string {
  const id = enfantActifId();
  return id ? `${CLE_JOURNAL}:${id}` : CLE_JOURNAL;
}
function cleParcours(): string {
  const id = enfantActifId();
  return id ? `${CLE_PARCOURS}:${id}` : CLE_PARCOURS;
}

function lireNombre(cle: string): number {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(cle));
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

export function lireEtoiles(): number {
  return lireNombre(cleEtoiles());
}

export function lireJournal(): JournalEntree[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = window.localStorage.getItem(cleJournal());
    const liste = brut ? (JSON.parse(brut) as JournalEntree[]) : [];
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

/* ================= Nuage (session élève) ================= */

type DonneesNuage = {
  etoiles: number;
  journal: JournalEntree[];
  parcours: Parcours | null;
};

/*
 * La table « progression » est créée à l'application de la migration ; les
 * types générés ne la connaissent pas encore, donc on accède à la table avec
 * une interface minimale.
 */
type RangeeNuage = {
  etoiles?: number;
  journal?: JournalEntree[] | null;
  parcours?: Parcours | null;
};
type TableNuage = {
  select: (colonnes: string) => {
    eq: (colonne: string, valeur: string) => {
      maybeSingle: () => Promise<{ data: RangeeNuage | null; error: unknown }>;
    };
  };
  upsert: (rangee: Record<string, unknown>) => Promise<{ error: unknown }>;
};

async function tableNuage(): Promise<TableNuage | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    return (supabase as unknown as { from: (table: string) => TableNuage }).from("progression");
  } catch {
    return null;
  }
}

/** Charge la progression d'un enfant depuis le nuage dans le cache local. */
export async function chargerProgresNuage(enfantId: string): Promise<boolean> {
  try {
    const table = await tableNuage();
    if (!table) return false;
    const { data, error } = await table.select("etoiles, journal, parcours").eq("enfant_id", enfantId).maybeSingle();
    if (error || !data) return false;
    if (typeof window === "undefined") return true;
    try {
      window.localStorage.setItem(cleEtoiles(), String(data.etoiles ?? 0));
      window.localStorage.setItem(
        cleJournal(),
        JSON.stringify(Array.isArray(data.journal) ? data.journal : []),
      );
      window.localStorage.setItem(
        cleParcours(),
        JSON.stringify(data.parcours ?? parcoursVierge()),
      );
    } catch {
      /* stockage indisponible */
    }
    emit();
    return true;
  } catch {
    return false;
  }
}

async function sauverProgresNuage(enfantId: string, donnees: DonneesNuage): Promise<void> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const table = await tableNuage();
    if (!table) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    await table.upsert({
      enfant_id: enfantId,
      parent_id: userData.user.id,
      etoiles: donnees.etoiles,
      journal: donnees.journal,
      parcours: donnees.parcours ?? {},
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* la sauvegarde dans le nuage peut attendre la prochaine réussite */
  }
}

let minuteur: ReturnType<typeof setTimeout> | null = null;

/** Sauvegarde différée (1 s) pour ne pas écrire à chaque geste. */
function planifierSauvegardeNuage(): void {
  const id = enfantActifId();
  if (!id) return;
  if (minuteur) clearTimeout(minuteur);
  minuteur = setTimeout(() => {
    void sauverProgresNuage(id, {
      etoiles: lireEtoiles(),
      journal: lireJournal(),
      parcours: lireParcours(),
    });
  }, 1000);
}

/* ================= Parcours du jour ================= */

/** Les étapes du parcours du jour : une routine guidée et courte. */
export const ETAPES_PARCOURS: Array<{
  activite: NomActivite;
  vers: "/manipule" | "/represente" | "/pratique";
  titre: string;
  emoji: string;
  but: number;
}> = [
  { activite: "manipule", vers: "/manipule", titre: "je manipule", emoji: "👐", but: 2 },
  { activite: "represente", vers: "/represente", titre: "je représente", emoji: "👀", but: 3 },
  { activite: "pratique", vers: "/pratique", titre: "je pratique", emoji: "✏️", but: 3 },
];

export type Parcours = {
  date: string;
  etape: number;
  faits: number;
  termine: boolean;
};

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parcoursVierge(): Parcours {
  return { date: aujourdhui(), etape: 0, faits: 0, termine: false };
}

export function lireParcours(): Parcours {
  if (typeof window === "undefined") return parcoursVierge();
  try {
    const brut = window.localStorage.getItem(cleParcours());
    const p = brut ? (JSON.parse(brut) as Parcours) : null;
    if (!p || p.date !== aujourdhui()) return parcoursVierge();
    return p;
  } catch {
    return parcoursVierge();
  }
}

export function demarrerParcours(): Parcours {
  const p = parcoursVierge();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(cleParcours(), JSON.stringify(p));
    } catch {
      /* stockage indisponible : le parcours vit juste en mémoire */
    }
  }
  planifierSauvegardeNuage();
  emit();
  return p;
}

export type ResultatReussite = {
  etoiles: number;
  /** vrai quand le total vient d'atteindre un multiple de 5. */
  palier: boolean;
  parcours: Parcours;
  /** vrai quand cette réussite vient de terminer une étape du parcours. */
  etapeTerminee: boolean;
  parcoursTermine: boolean;
};

/** À appeler une seule fois par exercice réussi. */
export function reussite(
  activite: NomActivite,
  a: number,
  b: number,
  op: Operation = "x",
): ResultatReussite {
  let etoiles = lireEtoiles() + 1;
  const parcours = lireParcours();
  let etapeTerminee = false;
  let parcoursTermine = false;

  if (!parcours.termine) {
    const courante = ETAPES_PARCOURS[parcours.etape];
    if (courante && courante.activite === activite) {
      parcours.faits += 1;
      if (parcours.faits >= courante.but) {
        parcours.etape += 1;
        parcours.faits = 0;
        etapeTerminee = true;
        if (parcours.etape >= ETAPES_PARCOURS.length) {
          parcours.termine = true;
          parcoursTermine = true;
          etoiles += 3; // récompense du parcours
        }
      }
    }
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(cleEtoiles(), String(etoiles));
      window.localStorage.setItem(cleParcours(), JSON.stringify(parcours));
      const journal = lireJournal();
      journal.unshift({ activite, a, b, op, ts: Date.now() });
      window.localStorage.setItem(cleJournal(), JSON.stringify(journal.slice(0, 100)));
    } catch {
      /* stockage indisponible : on continue sans sauvegarder */
    }
  }
  planifierSauvegardeNuage();
  emit();

  return {
    etoiles,
    palier: etoiles % 5 === 0,
    parcours,
    etapeTerminee,
    parcoursTermine,
  };
}

/** Petit message de progression à montrer après un bravo (sinon chaîne vide). */
export function messageBravo(r: ResultatReussite): string {
  if (r.parcoursTermine) return "🌈 Tu as terminé le parcours du jour ! +3 étoiles";
  if (r.palier) return `🌟 Tu as déjà ${r.etoiles} étoiles !`;
  return "";
}

export function effacerProgres(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(cleEtoiles());
    window.localStorage.removeItem(cleJournal());
    window.localStorage.removeItem(cleParcours());
  } catch {
    /* rien à effacer */
  }
  planifierSauvegardeNuage();
  emit();
}

/** Étoiles + parcours, rafraîchis à chaque réussite ou changement d'enfant. */
export function useProgres(): { etoiles: number; parcours: Parcours } {
  const [etat, setEtat] = useState({ etoiles: 0, parcours: parcoursVierge() });

  useEffect(() => {
    const lire = () => setEtat({ etoiles: lireEtoiles(), parcours: lireParcours() });
    lire();
    window.addEventListener(EVENEMENT, lire);
    return () => window.removeEventListener(EVENEMENT, lire);
  }, []);

  return etat;
}
