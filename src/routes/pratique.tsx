import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AireGroupes } from "@/components/multi/AireGroupes";
import { BandeauParcours } from "@/components/multi/Etoiles";
import { Bouton, Carte, Consigne, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerMultiplication, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/pratique")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je pratique — J'apprends ici" },
      {
        name: "description",
        content: "Des multiplications à son rythme, avec une aide qui ramène aux jetons plutôt que de donner la réponse.",
      },
      { property: "og:title", content: "Je pratique — J'apprends ici" },
      { property: "og:description", content: "Pratiquer les tables sans chronomètre, avec les jetons comme aide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pratique,
});

function Pratique() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 4, b: 3 });
  const [reponse, setReponse] = useState("");
  const [etat, setEtat] = useState<"attente" | "reussi" | "presque">("attente");
  const [aide, setAide] = useState(false);
  const [secondes, setSecondes] = useState(0);
  const [bravo, setBravo] = useState("");

  useEffect(() => {
    if (charge) nouvelle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  useEffect(() => {
    if (!reglages.chrono || etat === "reussi") return;
    const t = setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [reglages.chrono, etat, ex]);

  function nouvelle() {
    setEx(tirerMultiplication(reglages));
    setReponse("");
    setEtat("attente");
    setAide(false);
    setSecondes(0);
    setBravo("");
  }

  function verifier() {
    if (etat === "reussi") return;
    const juste = Number(reponse) === ex.a * ex.b;
    setEtat(juste ? "reussi" : "presque");
    if (juste) setBravo(messageBravo(reussite("pratique", ex.a, ex.b)));
  }

  return (
    <Page titre="je pratique">
      <BandeauParcours activite="pratique" />
      <Carte>
        <Consigne texte={`${ex.a} × ${ex.b} = ?`} audio={reglages.audio} />

        {reglages.chrono && (
          <p className="mt-2 text-center text-base text-inksoft">{secondes} s</p>
        )}

        <div className="mt-8 flex justify-center">
          <input
            inputMode="numeric"
            aria-label="ta réponse"
            value={reponse}
            onChange={(e) => {
              setReponse(e.target.value.replace(/\D/g, "").slice(0, 3));
              setEtat("attente");
            }}
            className="w-32 rounded-2xl border-2 border-ink/20 bg-white px-4 py-3 text-center text-4xl font-extrabold"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Bouton onClick={verifier}>Vérifier</Bouton>
          <Bouton variante="doux" onClick={() => setAide((a) => !a)}>
            💡 J'ai besoin d'aide
          </Bouton>
          <Bouton variante="doux" onClick={nouvelle}>
            Autre multiplication
          </Bouton>
        </div>

        {etat === "reussi" && (
          <div className="mt-6 space-y-2 text-center">
            <p className="text-3xl font-extrabold">🎉 Bravo!</p>
            <p className="text-2xl font-bold">
              {ex.a} groupes de {ex.b}
            </p>
            {reglages.additionRepetee && (
              <p className="text-xl font-bold text-inksoft">
                {Array.from({ length: ex.a }, () => ex.b).join(" + ")} = {ex.a * ex.b}
              </p>
            )}
            {bravo && <p className="pt-1 text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
        {etat === "presque" && (
          <p className="mt-6 text-center text-xl font-bold text-inksoft">
            Essaie encore, tu peux t'aider des jetons. 🌱
          </p>
        )}

        {aide && (
          <div className="mt-8 rounded-3xl bg-secondary/40 p-4 sm:p-6">
            <p className="mb-4 text-center text-xl font-bold">
              Place {ex.b} jetons dans chacun des {ex.a} groupes, puis compte-les.
            </p>
            <AireGroupes nbGroupes={ex.a} nbJetons={ex.a * ex.b} cleReset={`${ex.a}-${ex.b}`} />
          </div>
        )}
      </Carte>
    </Page>
  );
}
