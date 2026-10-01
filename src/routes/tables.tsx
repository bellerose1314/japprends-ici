import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Carte, Page } from "@/components/multi/Ui";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";

export const Route = createFileRoute("/tables")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Les tables de multiplication — J'apprends ici" },
      {
        name: "description",
        content:
          "Réviser les tables de multiplication de 1 à 10 : les multiples de 1, de 2, de 3… avec ou sans les réponses.",
      },
      { property: "og:title", content: "Les tables de multiplication — J'apprends ici" },
      {
        property: "og:description",
        content: "Les tables de 1 à 10, à réviser doucement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tables,
});

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Tables() {
  const [table, setTable] = useState(2);
  const [cacher, setCacher] = useState(false);
  const [trouvees, setTrouvees] = useState<number[]>([]);
  const voix = useVoixDisponible();

  function choisir(t: number) {
    setTable(t);
    setTrouvees([]);
  }

  function toucher(k: number) {
    if (!cacher) return;
    setTrouvees((t) => (t.includes(k) ? t : [...t, k]));
  }

  function ecouter(k: number) {
    prononcer(`${table} fois ${k} égale ${table * k}`);
  }

  return (
    <Page titre="📖 les tables">
      <p className="text-center text-lg text-inksoft sm:text-xl">
        choisis une table, puis révise-la à ton rythme.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
        {TABLES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => choisir(t)}
            aria-pressed={table === t}
            className={`rounded-2xl px-4 py-3 text-lg font-extrabold shadow-sm transition-transform active:scale-[0.97] sm:px-5 sm:text-xl ${
              table === t
                ? "bg-ink text-white"
                : "border border-white bg-white/80 text-ink"
            }`}
          >
            × {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Carte>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold sm:text-2xl">
              la table de {table}
            </h2>
            <button
              type="button"
              onClick={() => {
                setCacher((c) => !c);
                setTrouvees([]);
              }}
              className="rounded-full border border-white bg-white/80 px-4 py-2 text-base font-bold text-ink shadow-sm transition-transform active:scale-[0.98]"
            >
              {cacher ? "👀 voir les réponses" : "🙈 cacher les réponses"}
            </button>
          </div>

          {cacher && (
            <p className="mt-2 text-base text-inksoft">
              touche une ligne pour découvrir la réponse.
            </p>
          )}

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((k) => {
              const visible = !cacher || trouvees.includes(k);
              return (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => toucher(k)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-3 text-xl font-extrabold shadow-sm transition-transform active:scale-[0.98] sm:text-2xl ${
                      visible
                        ? "border border-white bg-white/80 text-ink"
                        : "border-2 border-dashed border-ink/20 bg-white/50 text-inksoft"
                    }`}
                  >
                    <span>
                      {table} × {k} = {visible ? table * k : "?"}
                    </span>
                    {visible && voix && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`écouter ${table} fois ${k}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          ecouter(k);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            ecouter(k);
                          }
                        }}
                        className="rounded-full border border-white bg-white/80 px-3 py-1 text-lg"
                      >
                        🔊
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </Carte>
      </div>
    </Page>
  );
}
