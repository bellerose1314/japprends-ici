import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BandeauParcours } from "@/components/multi/Etoiles";
import { Bouton, Carte, Consigne, Groupes, Page } from "@/components/multi/Ui";
import { messageBravo, reussite } from "@/lib/multi/progres";
import { tirerMultiplication, useReglages } from "@/lib/multi/reglages";

export const Route = createFileRoute("/comprends")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je comprends — J'apprends ici" },
      {
        name: "description",
        content: "Des groupes à l'addition répétée, puis à la multiplication : une étape à la fois.",
      },
      { property: "og:title", content: "Je comprends — J'apprends ici" },
      { property: "og:description", content: "Compter les groupes, écrire l'addition, écrire la multiplication." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Comprends,
});

function Champ({
  valeur,
  onChange,
  large = false,
}: {
  valeur: string;
  onChange: (v: string) => void;
  large?: boolean;
}) {
  return (
    <input
      inputMode="numeric"
      value={valeur}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
      className={`rounded-2xl border-2 border-ink/20 bg-white px-3 py-2 text-center text-2xl font-extrabold ${
        large ? "w-24" : "w-20"
      }`}
    />
  );
}

function Comprends() {
  const [reglages, , charge] = useReglages();
  const [ex, setEx] = useState({ a: 4, b: 3 });
  const [etape, setEtape] = useState(0);
  const [r, setR] = useState<string[]>(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [bravo, setBravo] = useState("");

  useEffect(() => {
    if (charge) nouvelle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charge]);

  function nouvelle() {
    const tire = tirerMultiplication(reglages);
    setEx({ a: tire.a, b: tire.b });
    setEtape(0);
    setR(["", "", "", "", "", ""]);
    setMessage("");
    setBravo("");
  }

  const maj = (i: number) => (v: string) =>
    setR((anciens) => anciens.map((x, j) => (j === i ? v : x)));

  const etapes = [
    { texte: "Combien y a-t-il de groupes?", ok: () => Number(r[0]) === ex.a },
    { texte: "Combien y a-t-il d'objets dans chaque groupe?", ok: () => Number(r[1]) === ex.b },
    {
      texte: "Complète : ___ groupes de ___",
      ok: () => Number(r[2]) === ex.a && Number(r[3]) === ex.b,
    },
    ...(reglages.additionRepetee
      ? [{ texte: "Complète l'addition.", ok: () => Number(r[4]) === ex.a * ex.b }]
      : []),
    { texte: "Complète la multiplication.", ok: () => Number(r[5]) === ex.a * ex.b },
  ];

  const courante = etapes[Math.min(etape, etapes.length - 1)];
  const termine = etape >= etapes.length;

  function verifier() {
    if (!courante || termine) return;
    if (courante.ok()) {
      setMessage("");
      if (etape + 1 >= etapes.length) {
        setBravo(messageBravo(reussite("comprends", ex.a, ex.b)));
      }
      setEtape((e) => e + 1);
    } else {
      setMessage("Regarde bien l'image. 🌱");
    }
  }

  return (
    <Page titre="je comprends">
      <BandeauParcours activite="comprends" />
      <Carte>
        <div className="mb-8">
          <Groupes a={ex.a} b={ex.b} />
        </div>

        {termine ? (
          <div className="space-y-3 text-center">
            <p className="text-3xl font-extrabold">🎉 Bravo!</p>
            <p className="text-2xl font-bold">
              {ex.a} groupes de {ex.b}
            </p>
            {reglages.additionRepetee && (
              <p className="text-2xl font-bold">
                {Array.from({ length: ex.a }, () => ex.b).join(" + ")} = {ex.a * ex.b}
              </p>
            )}
            <p className="text-3xl font-extrabold">
              {ex.a} × {ex.b} = {ex.a * ex.b}
            </p>
            {bravo && <p className="pt-2 text-xl font-bold text-inksoft">{bravo}</p>}
            <div className="pt-4">
              <Bouton onClick={nouvelle}>Une autre image</Bouton>
            </div>
          </div>
        ) : (
          <>
            <Consigne texte={courante?.texte ?? ""} audio={reglages.audio} />

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold">
              {etape === 0 && <Champ valeur={r[0] ?? ""} onChange={maj(0)} />}
              {etape === 1 && <Champ valeur={r[1] ?? ""} onChange={maj(1)} />}
              {etape === 2 && (
                <>
                  <Champ valeur={r[2] ?? ""} onChange={maj(2)} />
                  <span>groupes de</span>
                  <Champ valeur={r[3] ?? ""} onChange={maj(3)} />
                </>
              )}
              {etape === 3 && reglages.additionRepetee && (
                <>
                  <span>{Array.from({ length: ex.a }, () => ex.b).join(" + ")} =</span>
                  <Champ valeur={r[4] ?? ""} onChange={maj(4)} />
                </>
              )}
              {((etape === 3 && !reglages.additionRepetee) || etape === 4) && (
                <>
                  <span>
                    {ex.a} × {ex.b} =
                  </span>
                  <Champ valeur={r[5] ?? ""} onChange={maj(5)} large />
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Bouton onClick={verifier}>Vérifier</Bouton>
              <Bouton variante="doux" onClick={nouvelle}>
                Une autre image
              </Bouton>
            </div>

            {message && (
              <p className="mt-6 text-center text-xl font-bold text-inksoft">{message}</p>
            )}
          </>
        )}
      </Carte>
    </Page>
  );
}
