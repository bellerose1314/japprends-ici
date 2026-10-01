import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AireInfinie, totalZone, type ComptesInfinis } from "@/components/multi/AireInfinie";
import { BandeauParcours } from "@/components/multi/Etoiles";
import { Bouton, Carte, Consigne, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerMultiplication, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/manipule")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je manipule — J'apprends ici" },
      {
        name: "description",
        content: "Glisse les jetons dans les groupes et découvre ce que veut dire 3 × 4.",
      },
      { property: "og:title", content: "Je manipule — J'apprends ici" },
      { property: "og:description", content: "Des jetons à glisser pour construire des groupes égaux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Manipule,
});

function Manipule() {
  const [reglages, , charge] = useReglages();
  const [niveau, setNiveau] = useState<1 | 2>(1);
  const [ex, setEx] = useState({ a: 3, b: 4 });
  const [brut, setBrut] = useState<ComptesInfinis>({});
  const comptes = Array.from({ length: ex.a }, (_, i) => totalZone(brut, String(i)));
  const [etat, setEtat] = useState<"attente" | "reussi" | "presque">("attente");
  const [etape, setEtape] = useState(0);
  const [cle, setCle] = useState("0");
  const [bravo, setBravo] = useState("");

  useEffect(() => {
    if (charge) nouvelExercice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge, niveau]);

  function nouvelExercice() {
    setEx(tirerMultiplication(reglages));
    setEtat("attente");
    setEtape(0);
    setBravo("");
    setCle(String(Date.now()));
  }


  const consigne =
    niveau === 1
      ? `Fais ${ex.a} groupes de ${ex.b} jetons.`
      : `Construis ${ex.a} × ${ex.b}.`;

  const addition = useMemo(
    () => Array.from({ length: ex.a }, () => ex.b).join(" + "),
    [ex],
  );

  function verifier() {
    if (etat === "reussi") return;
    const juste =
      comptes.length === ex.a && comptes.every((c) => c === ex.b);
    setEtat(juste ? "reussi" : "presque");
    setEtape(juste ? 1 : 0);
    if (juste) setBravo(messageBravo(reussite("manipule", ex.a, ex.b)));
  }

  // Apparition progressive des écritures après la réussite.
  useEffect(() => {
    if (etat !== "reussi") return;
    const maxEtape = reglages.additionRepetee ? 4 : 3;
    if (etape >= maxEtape) return;
    const t = setTimeout(() => setEtape((e) => e + 1), 900);
    return () => clearTimeout(t);
  }, [etat, etape, reglages.additionRepetee]);

  const message =
    comptes.some((c) => c > ex.b)
      ? "Regarde bien tes groupes. 🌱"
      : "Il manque encore des jetons dans un groupe.";

  return (
    <Page titre={niveau === 1 ? "je manipule · les groupes" : "je manipule · l'écriture"}>
      <BandeauParcours activite="manipule" />
      <div className="mb-6 flex justify-center gap-2">
        {[1, 2].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNiveau(n as 1 | 2)}
            className={`rounded-full px-5 py-2 text-base font-bold ${
              niveau === n ? "bg-ink text-white" : "border border-white bg-white/70 text-inksoft"
            }`}
          >
            niveau {n}
          </button>
        ))}
      </div>

      <Carte>
        <Consigne texte={consigne} audio={reglages.audio} />

        <div className="mt-8">
          <AireInfinie
            disposition="groupes"
            zones={Array.from({ length: ex.a }, (_, i) => ({ cle: String(i), titre: "" }))}
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
                {ex.a} groupes de {ex.b}
              </p>
            )}
            {etape >= 2 && reglages.additionRepetee && (
              <p className="text-2xl font-bold">{addition}</p>
            )}
            {etape >= (reglages.additionRepetee ? 3 : 2) && (
              <p className="text-3xl font-extrabold">
                {ex.a} × {ex.b} = {ex.a * ex.b}
              </p>
            )}
            {bravo && <p className="pt-2 text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
      </Carte>
    </Page>
  );
}
