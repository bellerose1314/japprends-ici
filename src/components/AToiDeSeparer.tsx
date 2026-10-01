import { useEffect, useState } from "react";

import { BlocsSons } from "@/components/BlocsSons";
import { coupuresAttendues, type MotAnalyse } from "@/lib/phonetique/segmenter";

interface Props {
  analyse: MotAnalyse;
  actif: boolean;
}

type Etat = "attente" | "reussi" | "presque" | "arecommencer";

const MESSAGES: Record<Exclude<Etat, "attente">, string> = {
  reussi: "Bravo !",
  presque: "Bien essayé ! Regarde les sons.",
  arecommencer: "Essaie encore.",
};

export function AToiDeSeparer({ analyse, actif }: Props) {
  const mot = analyse.mot;
  const [coupures, setCoupures] = useState<number[]>([]);
  const [etat, setEtat] = useState<Etat>("attente");

  useEffect(() => {
    setCoupures([]);
    setEtat("attente");
  }, [mot]);

  const basculer = (position: number) => {
    setEtat("attente");
    setCoupures((actuelles) =>
      actuelles.includes(position)
        ? actuelles.filter((p) => p !== position)
        : [...actuelles, position].sort((a, b) => a - b),
    );
  };

  const verifier = () => {
    const attendues = coupuresAttendues(analyse);
    const bonnes = coupures.filter((c) => attendues.includes(c)).length;
    if (bonnes === attendues.length && coupures.length === attendues.length) {
      setEtat("reussi");
    } else if (bonnes >= Math.ceil(attendues.length / 2)) {
      setEtat("presque");
    } else {
      setEtat("arecommencer");
    }
  };

  const recommencer = () => {
    setCoupures([]);
    setEtat("attente");
  };

  const montrerReponse = etat === "reussi" || etat === "presque" || etat === "arecommencer";

  return (
    <div
      className={`glass glow rounded-3xl border p-6 transition ${
        actif ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">🧩 À toi de séparer</h2>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-inksoft">
          Activité
        </span>
      </div>
      <p className="mb-4 font-medium text-inksoft">
        Touche entre les lettres pour séparer les sons.
      </p>

      {mot ? (
        <div className="flex flex-wrap items-center">
          {mot.split("").map((lettre, i) => (
            <span key={`l-${i}`} className="flex items-center">
              <span className="font-display inline-flex min-w-11 items-center justify-center rounded-2xl border border-white bg-white px-2 py-3 text-2xl font-extrabold text-ink">
                {lettre}
              </span>
              {i < mot.length - 1 && (
                <button
                  type="button"
                  onClick={() => basculer(i + 1)}
                  aria-label={`Séparer après la lettre ${i + 1}`}
                  aria-pressed={coupures.includes(i + 1)}
                  className={`mx-0.5 h-12 rounded-full transition-all ${
                    coupures.includes(i + 1)
                      ? "w-5 bg-ink/70"
                      : "w-3 bg-inksoft/15 hover:bg-inksoft/35"
                  }`}
                />
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-inksoft">Écris d'abord un mot.</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={verifier}
          disabled={!mot}
          className="font-display rounded-2xl bg-ink px-5 py-3 text-base font-bold text-white transition hover:bg-ink/90 disabled:opacity-40"
        >
          Vérifier
        </button>
        <button
          type="button"
          onClick={recommencer}
          className="font-display rounded-2xl border border-white bg-white/80 px-5 py-3 text-base font-bold text-ink transition hover:bg-white"
        >
          Recommencer
        </button>
      </div>

      {montrerReponse && (
        <div className="mt-4 rounded-2xl border border-white bg-white/70 p-4">
          <p className="font-display mb-3 font-bold">{MESSAGES[etat]}</p>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-inksoft">
            La bonne séparation
          </p>
          <BlocsSons analyse={analyse} taille="sm" etiquettes />
        </div>
      )}
    </div>
  );
}
