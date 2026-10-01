import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AireInfinie, type ComptesInfinis } from "@/components/multi/AireInfinie";
import { Bouton, Carte, Consigne, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerSoustraction, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/soustraction")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je soustrais — J'apprends ici" },
      {
        name: "description",
        content:
          "Enlever des jetons pour comprendre la soustraction : 8 jetons, j'en enlève 3, il en reste 5.",
      },
      { property: "og:title", content: "Je soustrais — J'apprends ici" },
      { property: "og:description", content: "Des jetons à enlever pour comprendre la soustraction." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Soustraction,
});

function Soustraction() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 8, b: 3 });
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
    setEx(tirerSoustraction(reglages));
    setEtat("attente");
    setEtape(0);
    setBravo("");
    setReponse("");
    setCle(String(Date.now()));
  }

  function verifier() {
    if (etat === "reussi") return;
    const g = comptes["mes"] ?? {};
    const total = g["var(--son-a)"] ?? 0;
    const barres = g["x"] ?? 0;
    const jetonsOk = total === ex.a && barres === ex.b;
    const juste = jetonsOk && Number(reponse) === ex.a - ex.b;
    setMessage(
      total !== ex.a
        ? `Compte bien : il faut ${ex.a} ronds dans la boîte. 🌱`
        : barres !== ex.b
          ? `Il faut barrer ${ex.b} ronds d'un X. 🌱`
          : "Compte les ronds qui ne sont pas barrés. 🌱",
    );
    setEtat(juste ? "reussi" : "presque");
    setEtape(juste ? 1 : 0);
    if (juste) setBravo(messageBravo(reussite("soustraction", ex.a, ex.b, "-")));
  }

  useEffect(() => {
    if (etat !== "reussi") return;
    if (etape >= 2) return;
    const t = setTimeout(() => setEtape((e) => e + 1), 900);
    return () => clearTimeout(t);
  }, [etat, etape]);


  return (
    <Page titre="je soustrais">
      <Carte>
        <Consigne
          texte={`${ex.a} − ${ex.b}. Mets ${ex.a} ronds, barre-en ${ex.b} d'un X, puis écris combien il en reste.`}
          audio={reglages.audio}
        />

        <div className="mt-8">
          <p className="mb-6 text-center text-6xl font-extrabold text-ink">
            {ex.a} − {ex.b}
          </p>
          <AireInfinie
            barrable
            sources={[{ teinte: "var(--son-a)", nom: "rond" }]}
            zones={[{ cle: "mes", titre: "" }]}
            cleReset={cle}
            onChange={setComptes}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-4xl font-extrabold text-ink">
          <span>
            {ex.a} − {ex.b} =
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
                {ex.a} ronds, j'en barre {ex.b}
              </p>
            )}
            {etape >= 2 && (
              <p className="text-3xl font-extrabold">
                {ex.a} − {ex.b} = {ex.a - ex.b}
              </p>
            )}
            {bravo && <p className="pt-2 text-xl font-bold text-inksoft">{bravo}</p>}
          </div>
        )}
      </Carte>
    </Page>
  );
}
