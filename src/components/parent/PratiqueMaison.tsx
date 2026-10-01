import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { Carte } from "@/components/multi/Ui";
import {
  LIBELLE_ETAT,
  lireProgres,
  nomNotion,
  useProgramme,
  type Aide,
  type Duree,
  type Etat,
  type Matiere,
} from "@/lib/parent/seance";
import { VERBES } from "@/lib/verbes/donnees";

const MATIERES: Array<{ id: Matiere; nom: string }> = [
  { id: "vocabulaire", nom: "📚 Mots de vocabulaire" },
  { id: "multiplication", nom: "🧮 Multiplications" },
  { id: "verbes", nom: "✏️ Verbes" },
];

const AIDES: Array<{ n: Aide; nom: string }> = [
  { n: 1, nom: "Avec beaucoup d'aide" },
  { n: 2, nom: "Avec un peu d'aide" },
  { n: 3, nom: "De façon autonome" },
];

const CONSEILS: Record<Matiere, string[]> = {
  multiplication: [
    "Avant de mémoriser 3 × 4, vérifiez qu'il comprend que c'est 3 groupes de 4 objets.",
    "Des pâtes, des boutons ou des Lego font d'excellents jetons.",
  ],
  verbes: [
    "S'il hésite, demandez-lui d'abord qui fait l'action, puis quel pronom peut le remplacer.",
    "« Les enfants », c'est comme « ils » : cette astuce aide beaucoup.",
  ],
  vocabulaire: [
    "Faites-lui écouter le mot, puis demandez-lui de dire les sons un à un.",
    "Regardez ensemble les blocs de couleur : chaque bloc est un son.",
  ],
};

function Pastille({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-lg font-bold transition-transform active:scale-[0.98] ${
        actif ? "bg-ink text-white" : "border border-white bg-white/70 text-ink"
      }`}
    >
      {actif ? "☑ " : "☐ "}
      {children}
    </button>
  );
}

export function PratiqueMaison() {
  const [p, modifier] = useProgramme();
  const navigate = useNavigate();
  const [progres, setProgres] = useState<Array<{ notion: string; etat: Etat }>>([]);
  useEffect(() => setProgres(lireProgres()), []);

  const basculer = <T,>(liste: T[], x: T): T[] => {
    const n = liste.includes(x) ? liste.filter((y) => y !== x) : [...liste, x];
    return n.length ? n : [x];
  };

  return (
    <>
      <Carte>
        <h2 className="text-2xl font-extrabold sm:text-3xl">Qu'est-ce qu'on pratique aujourd'hui ?</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {MATIERES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => modifier({ matiere: m.id })}
              className={`rounded-3xl p-5 text-left text-xl font-extrabold ${
                p.matiere === m.id ? "bg-ink text-white" : "border border-white bg-white/70"
              }`}
            >
              {m.nom}
            </button>
          ))}
        </div>

        {p.matiere === "verbes" && (
          <>
            <h3 className="mt-8 text-xl font-extrabold">Quels verbes ?</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {VERBES.map((v) => (
                <Pastille
                  key={v.infinitif}
                  actif={p.verbes.includes(v.infinitif)}
                  onClick={() => modifier({ verbes: basculer(p.verbes, v.infinitif) })}
                >
                  {v.infinitif}
                </Pastille>
              ))}
            </div>
            <p className="mt-3 text-base font-bold text-inksoft">Temps : présent</p>
          </>
        )}
        {p.matiere === "multiplication" && (
          <>
            <h3 className="mt-8 text-xl font-extrabold">Quelles tables ?</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <Pastille key={n} actif={p.tables.includes(n)} onClick={() => modifier({ tables: basculer(p.tables, n) })}>
                  ×{n}
                </Pastille>
              ))}
            </div>
          </>
        )}
        {p.matiere === "vocabulaire" && (
          <p className="mt-6 text-base font-bold text-inksoft">
            Les mots de la liste de l'enfant choisi sur l'accueil (« qui joue ? ») seront utilisés, sinon des mots
            d'exemple.
          </p>
        )}

        <h3 className="mt-8 text-xl font-extrabold">Niveau</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {AIDES.map((a) => (
            <Pastille key={a.n} actif={p.aide === a.n} onClick={() => modifier({ aide: a.n })}>
              {a.nom}
            </Pastille>
          ))}
        </div>

        <h3 className="mt-8 text-xl font-extrabold">Durée environ</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {([5, 10, 15] as Duree[]).map((d) => (
            <Pastille key={d} actif={p.duree === d} onClick={() => modifier({ duree: d })}>
              {d} minutes
            </Pastille>
          ))}
        </div>
        <p className="mt-2 text-sm text-inksoft">Aucun chronomètre n'est montré à l'enfant.</p>

        <button
          type="button"
          onClick={() => navigate({ to: "/seance" })}
          className="mt-8 w-full rounded-4xl bg-ink p-6 text-2xl font-extrabold text-white shadow-sm active:scale-[0.99]"
        >
          ▶️ Commencer une séance
        </button>

        <div className="mt-6 rounded-3xl border border-white bg-white/70 p-5">
          <p className="text-lg font-extrabold">💡 Comment l'aider ?</p>
          <ul className="mt-2 space-y-1 text-base text-inksoft">
            {CONSEILS[p.matiere].map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      </Carte>

      <div className="mt-6">
        <Carte>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ses progrès</h2>
          <p className="mt-1 text-base text-inksoft">
            Basé sur plusieurs réponses et plusieurs séances — jamais sur une seule réponse.
          </p>
          {progres.length === 0 ? (
            <p className="mt-4 rounded-3xl border border-white bg-white/70 p-4 text-lg font-bold text-inksoft">
              Les progrès apparaîtront après les premières séances.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {progres.map((x) => (
                <li
                  key={x.notion}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white bg-white/60 px-4 py-3 text-lg font-bold"
                >
                  <span>{nomNotion(x.notion)}</span>
                  <span>{LIBELLE_ETAT[x.etat]}</span>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
      <div className="mt-6" />
    </>
  );
}
