import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AireInfinie, totalZone, type ComptesInfinis } from "@/components/multi/AireInfinie";
import { Bouton, Carte, Consigne, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerDivision, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/division")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je partage — J'apprends ici" },
      {
        name: "description",
        content:
          "Partager des jetons en groupes égaux pour comprendre la division : 12 partagés en 3 groupes de 4.",
      },
      { property: "og:title", content: "Je partage — J'apprends ici" },
      { property: "og:description", content: "La division comme un partage juste en groupes égaux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Division,
});

function Division() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 12, b: 3 });
  const [brut, setBrut] = useState<ComptesInfinis>({});
  const comptes = Array.from({ length: ex.b }, (_, i) => totalZone(brut, String(i)));
  const [etat, setEtat] = useState<"attente" | "reussi" | "presque">("attente");
  const [etape, setEtape] = useState(0);
  const [cle, setCle] = useState("0");
  const [bravo, setBravo] = useState("");

  useEffect(() => {
    if (charge) nouvelExercice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  function nouvelExercice() {
    setEx(tirerDivision(reglages));
    setEtat("attente");
    setEtape(0);
    setBravo("");
    setCle(String(Date.now()));
  }

  const part = ex.a / ex.b;

  function verifier() {
    if (etat === "reussi") return;
    const total = comptes.reduce((s, c) => s + c, 0);
    const juste =
      total === ex.a && comptes.length === ex.b && comptes.every((c) => c === part);
    setEtat(juste ? "reussi" : "presque");
    setEtape(juste ? 1 : 0);
    if (juste) setBravo(messageBravo(reussite("division", ex.a, ex.b, ":")));
  }

  useEffect(() => {
    if (etat !== "reussi") return;
    if (etape >= 2) return;
    const t = setTimeout(() => setEtape((e) => e + 1), 900);
    return () => clearTimeout(t);
  }, [etat, etape]);

  const reste = ex.a - comptes.reduce((s, c) => s + c, 0);
  const message =
    reste > 0
      ? "Il reste des jetons à partager. 🌱"
      : "Regarde bien : chaque groupe doit avoir le même nombre. 🌱";

  return (
    <Page titre="je partage">
      <Carte>
        <Consigne
          texte={`Partage ${ex.a} jetons entre ${ex.b} groupes égaux.`}
          audio={reglages.audio}
        />

        <div className="mt-8">
          <AireInfinie
            disposition="groupes"
            zones={Array.from({ length: ex.b }, (_, i) => ({ cle: String(i), titre: "" }))}
            cleReset={cle}
            onChange={setBrut}
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Bouton onClick={verifier}>Vérifier</Bouton>
          <Bouton variante="doux" onClick={nouvelExercice}>
            Nouvel exercice
          </Bouton>
        </div>

        {etat === "presque" && (
          <p className="mt-6 text-center text-xl font-bold text-inksoft">{message}</p>
        )}

        {etat === "reussi" && (
          <div className="mt-8 space-y-3 text-center">
            <p className="text-3xl font-extrabold">🎉 Bravo!</p>
            {etape >= 1 && (
              <p className="text-2xl font-bold">
                {ex.a} partagés en {ex.b} groupes de {part}
              </p>
            )}
            {etape >= 2 && (
              <p className="text-3xl font-extrabold">
                {ex.a} ÷ {ex.b} = {part}
              </p>
            )}
            {bravo && <p className="pt-2 text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
      </Carte>
    </Page>
  );
}
