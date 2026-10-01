import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Bouton, Carte, Page } from "@/components/multi/Ui";
import { PratiqueMaison } from "@/components/parent/PratiqueMaison";
import { effacerProgres, lireJournal, useProgres } from "@/lib/multi/progres";
import type { NomActivite } from "@/lib/multi/reglages";

export const Route = createFileRoute("/parent")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Espace parent — J'apprends ici" },
      {
        name: "description",
        content:
          "Conseils pour accompagner les devoirs sans faire à la place, et résumé de ce qui a été travaillé sur cet appareil.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Parent,
});

const NOMS_ACTIVITES: Record<NomActivite, string> = {
  manipule: "je manipule",
  represente: "je représente",
  comprends: "je comprends",
  pratique: "je pratique",
  addition: "j'additionne",
  soustraction: "je soustrais",
  division: "je partage",
};

/** Écriture lisible d'une réussite du journal. */
function ecriture(e: { a: number; b: number; op?: "x" | "+" | "-" | ":" }): string {
  switch (e.op) {
    case "+":
      return `${e.a} + ${e.b} = ${e.a + e.b}`;
    case "-":
      return `${e.a} − ${e.b} = ${e.a - e.b}`;
    case ":":
      return `${e.a} ÷ ${e.b} = ${e.a / e.b}`;
    default:
      return `${e.a} × ${e.b} = ${e.a * e.b}`;
  }
}

const CONSEILS: Array<{ titre: string; texte: string }> = [
  {
    titre: "Court et régulier",
    texte:
      "Dix minutes par jour valent mieux qu'une longue séance. Le parcours du jour est pensé pour ça.",
  },
  {
    titre: "Laisser chercher",
    texte:
      "Si votre enfant hésite, proposez les jetons plutôt que la réponse. Le bouton « J'ai besoin d'aide » fait exactement ça.",
  },
  {
    titre: "Faire verbaliser",
    texte:
      "Demandez : « Raconte-moi ce que tu as fait. » Expliquer avec ses mots consolide plus que répéter.",
  },
  {
    titre: "Pas de course",
    texte:
      "Le chronomètre existe dans les réglages, mais il est désactivé par défaut : la vitesse viendra avec la compréhension.",
  },
  {
    titre: "Valoriser l'effort",
    texte:
      "Les étoiles récompensent chaque exercice réussi, peu importe le temps. Soulignez la persévérance, pas la rapidité.",
  },
];

function Parent() {
  const { etoiles, parcours } = useProgres();
  const [confirmation, setConfirmation] = useState(false);
  const journal = typeof window === "undefined" ? [] : lireJournal();

  const parActivite = journal.reduce<Partial<Record<NomActivite, number>>>(
    (acc, e) => ({ ...acc, [e.activite]: (acc[e.activite] ?? 0) + 1 }),
    {},
  );

  return (
    <Page titre="👨‍👩‍👧 espace parent">
      <PratiqueMaison />
      <Carte>
        <h2 className="text-2xl font-extrabold sm:text-3xl">Ce qui a été travaillé ici</h2>
        <p className="mt-2 text-base text-inksoft">
          Ces informations restent sur cet appareil — rien n'est envoyé ailleurs.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <p className="rounded-3xl border border-white bg-white/70 p-4 text-lg font-bold">
            ⭐ {etoiles} {etoiles > 1 ? "étoiles gagnées" : "étoile gagnée"}
          </p>
          <p className="rounded-3xl border border-white bg-white/70 p-4 text-lg font-bold">
            🌈 parcours du jour : {parcours.termine ? "terminé 🎉" : "pas encore terminé"}
          </p>
        </div>

        {journal.length > 0 ? (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(Object.keys(NOMS_ACTIVITES) as NomActivite[]).map((cle) =>
                parActivite[cle] ? (
                  <p
                    key={cle}
                    className="rounded-3xl border border-white bg-white/70 p-4 text-lg font-bold"
                  >
                    {NOMS_ACTIVITES[cle]} · {parActivite[cle]}{" "}
                    {(parActivite[cle] ?? 0) > 1 ? "réussites" : "réussite"}
                  </p>
                ) : null,
              )}
            </div>

            <h3 className="mt-8 text-xl font-extrabold">Derniers calculs travaillés</h3>
            <ul className="mt-3 space-y-2">
              {journal.slice(0, 8).map((e, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-white bg-white/60 px-4 py-2 text-lg font-bold"
                >
                  <span>{ecriture(e)}</span>
                  <span className="text-base font-bold text-inksoft">
                    {NOMS_ACTIVITES[e.activite]}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-6 rounded-3xl border border-white bg-white/70 p-4 text-lg font-bold text-inksoft">
            Aucun exercice réussi pour l'instant sur cet appareil.
          </p>
        )}

        <div className="mt-8">
          {confirmation ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-bold">Effacer les étoiles et l'historique ?</p>
              <Bouton
                variante="doux"
                onClick={() => {
                  effacerProgres();
                  setConfirmation(false);
                }}
              >
                Oui, tout effacer
              </Bouton>
              <Bouton variante="doux" onClick={() => setConfirmation(false)}>
                Annuler
              </Bouton>
            </div>
          ) : (
            <Bouton variante="doux" onClick={() => setConfirmation(true)}>
              Remettre la progression à zéro
            </Bouton>
          )}
        </div>
      </Carte>

      <div className="mt-6">
        <Carte>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Accompagner sans faire à la place</h2>
          <ul className="mt-6 space-y-5">
            {CONSEILS.map((c) => (
              <li key={c.titre} className="rounded-3xl border border-white bg-white/70 p-5">
                <p className="text-lg font-extrabold">{c.titre}</p>
                <p className="mt-1 text-base text-inksoft">{c.texte}</p>
              </li>
            ))}
          </ul>
        </Carte>
      </div>
    </Page>
  );
}
