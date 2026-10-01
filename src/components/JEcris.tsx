import { useEffect, useState } from "react";

import { BlocsSons } from "@/components/BlocsSons";
import { nettoyerMot, type MotAnalyse } from "@/lib/phonetique/segmenter";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";

interface Props {
  analyse: MotAnalyse;
  actif: boolean;
}

export function JEcris({ analyse, actif }: Props) {
  const mot = analyse.mot;
  const [reponse, setReponse] = useState("");
  const [verifie, setVerifie] = useState(false);
  const voix = useVoixDisponible();

  useEffect(() => {
    setReponse("");
    setVerifie(false);
  }, [mot]);

  const juste = nettoyerMot(reponse) === mot && mot !== "";

  return (
    <div
      className={`glass glow rounded-3xl border p-6 transition ${
        actif ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">✏️ J'écris mon mot</h2>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-inksoft">
          Activité
        </span>
      </div>
      <p className="mb-4 font-medium text-inksoft">Écoute le mot, puis écris-le.</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={reponse}
          onChange={(e) => {
            setReponse(e.target.value);
            setVerifie(false);
          }}
          placeholder="Écris ici…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="font-display w-full rounded-2xl border border-white bg-white/80 px-5 py-4 text-xl font-bold lowercase focus:ring-4 focus:ring-ring/60 focus:outline-none"
        />
        {voix && (
          <button
            type="button"
            onClick={() => prononcer(mot)}
            aria-label="Écouter le mot"
            className="shrink-0 rounded-2xl border border-white bg-white/80 px-4 text-2xl transition hover:bg-white"
          >
            🔊
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setVerifie(true)}
        disabled={!mot || reponse.trim() === ""}
        className="font-display mt-3 rounded-2xl bg-ink px-5 py-3 text-base font-bold text-white transition hover:bg-ink/90 disabled:opacity-40"
      >
        Vérifier
      </button>

      {verifie && (
        <div className="mt-4 rounded-2xl border border-white/70 bg-mist/60 p-4">
          <p className="font-display mb-3 font-bold">
            {juste ? "Bravo !" : "Bien essayé ! Compare avec le modèle."}
          </p>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-inksoft">
            Le modèle
          </p>
          <BlocsSons analyse={analyse} taille="sm" etiquettes />
        </div>
      )}
    </div>
  );
}
