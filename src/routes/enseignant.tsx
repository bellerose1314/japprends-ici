import { createFileRoute } from "@tanstack/react-router";

import { Carte, Page } from "@/components/multi/Ui";
import { REGLAGES_DEFAUT, useReglages, type NomActivite } from "@/lib/multi/reglages";
import { TEMPS, VERBES } from "@/lib/verbes/donnees";
import {
  REGLAGES_VERBES_DEFAUT,
  useReglagesVerbes,
  type ActiviteVerbe,
  type Niveau,
} from "@/lib/verbes/reglages";

const NOMS_VERBES: Record<ActiviteVerbe, string> = {
  construis: "🧱 Je construis",
  associe: "🔗 J'associe",
  complete: "✍️ Je complète",
  pronom: "👥 Je trouve le pronom",
  repere: "🔍 Je repère",
  pratique: "🌈 Je pratique",
};

const NIVEAUX: Array<{ n: Niveau; nom: string; sous: string }> = [
  { n: 1, nom: "Niveau 1 — très guidé", sous: "pronoms, choix de réponses, couleurs" },
  { n: 2, nom: "Niveau 2 — semi-guidé", sous: "groupes sujets, moins de choix" },
  { n: 3, nom: "Niveau 3 — autonome", sous: "réponses à écrire, moins d'indices visuels" },
];

function ParametresVerbes() {
  const [r, modifier] = useReglagesVerbes();
  const basculer = (inf: string) => {
    const verbes = r.verbes.includes(inf) ? r.verbes.filter((v) => v !== inf) : [...r.verbes, inf];
    modifier({ verbes: verbes.length ? verbes : [inf] });
  };
  return (
    <Carte>
      <h2 className="text-2xl font-extrabold">Paramètres — verbes</h2>
      <h3 className="mt-6 text-xl font-extrabold">Verbes accessibles</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {VERBES.map((v) => (
          <Interrupteur key={v.infinitif} libelle={v.infinitif} actif={r.verbes.includes(v.infinitif)} onChange={() => basculer(v.infinitif)} />
        ))}
      </div>
      <h3 className="mt-8 text-xl font-extrabold">Temps accessibles</h3>
      <div className="mt-3 grid gap-3">
        {TEMPS.map((t) => (
          <Interrupteur
            key={t.id}
            libelle={t.actif ? t.nom : `${t.nom} (bientôt)`}
            actif={t.actif && r.temps.includes(t.id)}
            onChange={(v) => {
              if (!t.actif) return;
              const temps = v ? [...r.temps, t.id] : r.temps.filter((x) => x !== t.id);
              modifier({ temps: temps.length ? temps : ["present"] });
            }}
          />
        ))}
      </div>
      <h3 className="mt-8 text-xl font-extrabold">Activités</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(Object.keys(NOMS_VERBES) as ActiviteVerbe[]).map((cle) => (
          <Interrupteur
            key={cle}
            libelle={NOMS_VERBES[cle]}
            actif={r.activites[cle]}
            onChange={(v) => modifier({ activites: { ...r.activites, [cle]: v } })}
          />
        ))}
      </div>
      <h3 className="mt-8 text-xl font-extrabold">Niveau</h3>
      <div className="mt-3 grid gap-3">
        {NIVEAUX.map((n) => (
          <button
            key={n.n}
            type="button"
            onClick={() => modifier({ niveau: n.n })}
            className={`rounded-2xl px-4 py-4 text-left text-lg font-bold ${
              r.niveau === n.n ? "bg-ink text-white" : "bg-white/70"
            }`}
          >
            {n.nom}
            <span className="block text-base font-semibold opacity-80">{n.sous}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => modifier(REGLAGES_VERBES_DEFAUT)}
        className="mt-8 rounded-2xl border border-white bg-white/80 px-5 py-3 text-base font-bold text-inksoft"
      >
        Revenir aux réglages de départ
      </button>
    </Carte>
  );
}

export const Route = createFileRoute("/enseignant")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Espace enseignant — J'apprends ici" },
      {
        name: "description",
        content: "Choisir les tables, les activités, l'addition répétée, l'audio et le chronomètre.",
      },
      { property: "og:title", content: "Espace enseignant — J'apprends ici" },
      { property: "og:description", content: "Réglages conservés sur l'appareil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Enseignant,
});

const NOMS: Record<NomActivite, string> = {
  manipule: "👐 Je manipule",
  represente: "👀 Je représente",
  comprends: "🧠 Je comprends",
  pratique: "✏️ Je pratique",
  addition: "➕ J'additionne",
  soustraction: "➖ Je soustrais",
  division: "➗ Je partage",
};

function Interrupteur({
  libelle,
  actif,
  onChange,
}: {
  libelle: string;
  actif: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-4 text-lg font-bold">
      <span>{libelle}</span>
      <input
        type="checkbox"
        checked={actif}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 accent-[oklch(0.35_0.045_275)]"
      />
    </label>
  );
}

function Enseignant() {
  const [reglages, modifier] = useReglages();

  const basculerTable = (n: number) => {
    const tables = reglages.tables.includes(n)
      ? reglages.tables.filter((t) => t !== n)
      : [...reglages.tables, n].sort((a, b) => a - b);
    modifier({ tables: tables.length > 0 ? tables : [n] });
  };

  return (
    <Page titre="espace enseignant">
      <Carte>
        <h2 className="text-2xl font-extrabold">Tables à travailler</h2>
        <p className="mt-1 text-base text-inksoft">
          Ce sont les nombres de groupes proposés (le premier nombre).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => basculerTable(n)}
              className={`size-14 rounded-2xl text-xl font-extrabold ${
                reglages.tables.includes(n)
                  ? "bg-ink text-white"
                  : "border border-white bg-white/70 text-inksoft"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-extrabold">Nombre maximal dans un groupe</h2>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={reglages.maxFacteur}
            onChange={(e) => modifier({ maxFacteur: Number(e.target.value) })}
            className="h-3 w-full accent-[oklch(0.35_0.045_275)]"
          />
          <span className="w-12 text-center text-2xl font-extrabold">{reglages.maxFacteur}</span>
        </div>

        <h2 className="mt-10 text-2xl font-extrabold">Nombre maximal en addition et soustraction</h2>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={reglages.maxSomme}
            onChange={(e) => modifier({ maxSomme: Number(e.target.value) })}
            className="h-3 w-full accent-[oklch(0.35_0.045_275)]"
          />
          <span className="w-12 text-center text-2xl font-extrabold">{reglages.maxSomme}</span>
        </div>

        <h2 className="mt-10 text-2xl font-extrabold">Activités accessibles</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(NOMS) as NomActivite[]).map((cle) => (
            <Interrupteur
              key={cle}
              libelle={NOMS[cle]}
              actif={reglages.activites[cle]}
              onChange={(v) => modifier({ activites: { ...reglages.activites, [cle]: v } })}
            />
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-extrabold">Options</h2>
        <div className="mt-4 grid gap-3">
          <Interrupteur
            libelle="Afficher l'addition répétée"
            actif={reglages.additionRepetee}
            onChange={(v) => modifier({ additionRepetee: v })}
          />
          <Interrupteur
            libelle="Consignes lues à voix haute (bouton 🔊)"
            actif={reglages.audio}
            onChange={(v) => modifier({ audio: v })}
          />
          <Interrupteur
            libelle="Chronomètre dans « Je pratique »"
            actif={reglages.chrono}
            onChange={(v) => modifier({ chrono: v })}
          />
        </div>

        <button
          type="button"
          onClick={() => modifier(REGLAGES_DEFAUT)}
          className="mt-10 rounded-2xl border border-white bg-white/80 px-5 py-3 text-base font-bold text-inksoft"
        >
          Revenir aux réglages de départ
        </button>

        <p className="mt-6 text-sm text-inksoft">
          Les réglages sont conservés sur cet appareil seulement.
        </p>
      </Carte>
      <div className="mt-6">
        <ParametresVerbes />
      </div>
    </Page>
  );
}
