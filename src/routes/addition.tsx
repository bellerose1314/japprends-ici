import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AireInfinie, type ComptesInfinis } from "@/components/multi/AireInfinie";
import { Bouton, Carte, Consigne, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerAddition, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/addition")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "J'additionne — J'apprends ici" },
      {
        name: "description",
        content:
          "Rassembler deux collections de jetons pour comprendre l'addition : 5 jetons et 3 jetons, ça fait 8.",
      },
      { property: "og:title", content: "J'additionne — J'apprends ici" },
      { property: "og:description", content: "Des jetons à rassembler pour comprendre l'addition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Addition,
});

function Addition() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 5, b: 3 });
  const [comptes, setComptes] = useState<ComptesInfinis>({});
  const [etat, setEtat] = useState<"attente" | "reussi" | "presque">("attente");
  const [etape, setEtape] = useState(0);
  const [cle, setCle] = useState("0");
  const [bravo, setBravo] = useState("");
  const [reponse, setReponse] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (charge) nouvelExercice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  function nouvelExercice() {
    setEx(tirerAddition(reglages));
    setEtat("attente");
    setEtape(0);
    setBravo("");
    setReponse("");
    setCle(String(Date.now()));
  }

  function verifier() {
    if (etat === "reussi") return;
    const g = comptes["gauche"] ?? {};
    const d = comptes["droite"] ?? {};
    const jetonsOk =
      (g["var(--son-a)"] ?? 0) === ex.a && (g["var(--son-u)"] ?? 0) === 0 &&
      (d["var(--son-u)"] ?? 0) === ex.b && (d["var(--son-a)"] ?? 0) === 0;
    const juste = jetonsOk && Number(reponse) === ex.a + ex.b;
    setMessage(!jetonsOk ? "Regarde bien tes boîtes : les jetons orange à gauche, les bleus à droite. 🌱" : "Compte tous les jetons ensemble. 🌱");
    setEtat(juste ? "reussi" : "presque");
    setEtape(juste ? 1 : 0);
    if (juste) setBravo(messageBravo(reussite("addition", ex.a, ex.b, "+")));
  }

  useEffect(() => {
    if (etat !== "reussi") return;
    if (etape >= 2) return;
    const t = setTimeout(() => setEtape((e) => e + 1), 900);
    return () => clearTimeout(t);
  }, [etat, etape]);

  return (
    <Page titre="j'additionne">
      <Carte>
        <Consigne
          texte={`${ex.a} + ${ex.b}. Mets ${ex.a} jetons orange et ${ex.b} jetons bleus, puis écris le total.`}
          audio={reglages.audio}
        />

        <div className="mt-8">
          <p className="mb-6 text-center text-6xl font-extrabold text-ink">
            {ex.a} + {ex.b}
          </p>
          <AireInfinie
            separateur="+"
            zones={[
              { cle: "gauche", titre: `${ex.a} orange` },
              { cle: "droite", titre: `${ex.b} bleus` },
            ]}
            cleReset={cle}
            onChange={setComptes}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-4xl font-extrabold text-ink">
          <span>
            {ex.a} + {ex.b} =
          </span>
          <input
            inputMode="numeric"
            aria-label="la réponse"
            value={reponse}
            onChange={(e) => setReponse(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="w-24 rounded-2xl border-2 border-ink/20 bg-white py-2 text-center text-4xl font-extrabold"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Bouton onClick={verifier}>Vérifier</Bouton>
          <Bouton variante="doux" onClick={nouvelExercice}>
            Nouvel exercice
          </Bouton>
        </div>

        {etat === "presque" && (
          <p className="mt-6 text-center text-xl font-bold text-inksoft">
            {message}
          </p>
        )}

        {etat === "reussi" && (
          <div className="mt-8 space-y-3 text-center">
            <p className="text-3xl font-extrabold">🎉 Bravo!</p>
            {etape >= 1 && (
              <p className="text-2xl font-bold">
                {ex.a} jetons orange et {ex.b} jetons bleus
              </p>
            )}
            {etape >= 2 && (
              <p className="text-3xl font-extrabold">
                {ex.a} + {ex.b} = {ex.a + ex.b}
              </p>
            )}
            {bravo && <p className="pt-2 text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
      </Carte>
    </Page>
  );
}
