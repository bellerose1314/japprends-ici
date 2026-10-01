import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BandeauParcours } from "@/components/multi/Etoiles";
import { Bouton, Carte, Consigne, Groupes, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerMultiplication, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/represente")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je représente — J'apprends ici" },
      {
        name: "description",
        content: "Quelle image représente 3 × 2 ? Choisis les bons groupes.",
      },
      { property: "og:title", content: "Je représente — J'apprends ici" },
      { property: "og:description", content: "Relier l'écriture d'une multiplication à son image." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Represente,
});

type Choix = { a: number; b: number; bon: boolean };

function Represente() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 3, b: 2 });
  const [choix, setChoix] = useState<Choix[]>([]);
  const [selection, setSelection] = useState<number | null>(null);
  const [etat, setEtat] = useState<"attente" | "reussi" | "presque">("attente");
  const [bravo, setBravo] = useState("");

  useEffect(() => {
    if (charge) nouvelle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  function nouvelle() {
    let { a, b } = tirerMultiplication(reglages);
    if (a === b) b = b === 1 ? 2 : b - 1; // les deux images doivent être différentes
    const options: Choix[] = [
      { a, b, bon: true },
      { a: b, b: a, bon: false },
      { a, b: b + 1, bon: false },
    ].sort(() => Math.random() - 0.5);
    setEx({ a, b });
    setChoix(options);
    setSelection(null);
    setEtat("attente");
    setBravo("");
  }

  function verifier() {
    if (selection === null || etat === "reussi") return;
    const juste = choix[selection]?.bon ?? false;
    setEtat(juste ? "reussi" : "presque");
    if (juste) setBravo(messageBravo(reussite("represente", ex.a, ex.b)));
  }

  return (
    <Page titre="je représente">
      <BandeauParcours activite="represente" />
      <Carte>
        <Consigne texte={`Quelle image représente ${ex.a} × ${ex.b} ?`} audio={reglages.audio} />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {choix.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelection(i);
                setEtat("attente");
              }}
              className={`rounded-3xl border-2 bg-white/70 p-4 transition-transform active:scale-[0.99] ${
                selection === i ? "border-ink" : "border-transparent"
              }`}
            >
              <span className="mb-3 block text-lg font-extrabold text-inksoft">
                {["A", "B", "C"][i]}
              </span>
              <Groupes a={c.a} b={c.b} taille="sm" />
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Bouton onClick={verifier}>Vérifier</Bouton>
          <Bouton variante="doux" onClick={nouvelle}>
            Autre question
          </Bouton>
        </div>

        {etat === "reussi" && (
          <div className="mt-6 space-y-2 text-center">
            <p className="text-2xl font-extrabold">
              Oui! {ex.a} × {ex.b} signifie {ex.a} groupes de {ex.b}.
            </p>
            {bravo && <p className="text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
        {etat === "presque" && (
          <p className="mt-6 text-center text-xl font-bold text-inksoft">
            Regarde le nombre de groupes. 🌱
          </p>
        )}
      </Carte>
    </Page>
  );
}
