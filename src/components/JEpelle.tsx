import { useEffect, useMemo, useState } from "react";

import { BlocsSons } from "@/components/BlocsSons";
import type { MotAnalyse } from "@/lib/phonetique/segmenter";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";

interface Props {
  analyse: MotAnalyse;
  actif: boolean;
}

interface Jeton {
  id: number;
  lettre: string;
}

/** Mélange stable (dépend seulement du mot) pour éviter les sauts visuels. */
function melanger(mot: string): Jeton[] {
  const jetons: Jeton[] = mot.split("").map((lettre, id) => ({ id, lettre }));
  let graine = 0;
  for (const c of mot) graine = (graine * 31 + c.charCodeAt(0)) % 100000;
  for (let i = jetons.length - 1; i > 0; i--) {
    graine = (graine * 1103515245 + 12345) % 2147483648;
    const j = graine % (i + 1);
    const a = jetons[i]!;
    jetons[i] = jetons[j]!;
    jetons[j] = a;
  }
  return jetons;
}

export function JEpelle({ analyse, actif }: Props) {
  const mot = analyse.mot;
  const jetons = useMemo(() => melanger(mot), [mot]);
  const [choisis, setChoisis] = useState<Jeton[]>([]);
  const [verifie, setVerifie] = useState(false);
  const voix = useVoixDisponible();

  useEffect(() => {
    setChoisis([]);
    setVerifie(false);
  }, [mot]);

  const proposition = choisis.map((j) => j.lettre).join("");
  const juste = proposition === mot && mot !== "";
  const restants = jetons.filter((j) => !choisis.some((c) => c.id === j.id));

  const ajouter = (jeton: Jeton) => {
    setVerifie(false);
    setChoisis((c) => [...c, jeton]);
    if (voix) prononcer(jeton.lettre, 0.7);
  };

  return (
    <div
      className={`glass glow rounded-3xl border p-6 transition ${
        actif ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">🔠 J'épelle mon mot</h2>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-inksoft">
          Activité
        </span>
      </div>
      <p className="mb-4 font-medium text-inksoft">
        Place les lettres une à une, dans le bon ordre.
      </p>

      {/* Les cases du mot */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {mot.split("").map((_, i) => {
          const jeton = choisis[i];
          return (
            <span
              key={i}
              className={`font-display grid size-12 place-items-center rounded-xl border-2 text-2xl font-extrabold lowercase ${
                jeton ? "border-white bg-white" : "border-dashed border-ink/25 bg-white/40"
              }`}
            >
              {jeton?.lettre ?? ""}
            </span>
          );
        })}
        {voix && mot && (
          <button
            type="button"
            onClick={() => prononcer(mot)}
            aria-label="Écouter le mot"
            className="ml-1 shrink-0 rounded-2xl border border-white bg-white/80 px-4 py-2.5 text-2xl transition hover:bg-white"
          >
            🔊
          </button>
        )}
      </div>

      {/* Les lettres à placer */}
      <div className="flex flex-wrap gap-2">
        {restants.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => ajouter(j)}
            className="font-display size-12 rounded-xl border border-white bg-secondary text-2xl font-extrabold lowercase text-ink transition hover:brightness-95"
          >
            {j.lettre}
          </button>
        ))}
        {restants.length === 0 && (
          <p className="text-sm font-semibold text-inksoft">Toutes les lettres sont placées.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setVerifie(true)}
          disabled={choisis.length === 0}
          className="font-display rounded-2xl bg-ink px-5 py-3 text-base font-bold text-white transition hover:bg-ink/90 disabled:opacity-40"
        >
          Vérifier
        </button>
        <button
          type="button"
          onClick={() => {
            setChoisis((c) => c.slice(0, -1));
            setVerifie(false);
          }}
          disabled={choisis.length === 0}
          className="font-display rounded-2xl border border-white bg-white/80 px-5 py-3 text-base font-bold text-ink transition hover:bg-white disabled:opacity-40"
        >
          Effacer une lettre
        </button>
        <button
          type="button"
          onClick={() => {
            setChoisis([]);
            setVerifie(false);
          }}
          disabled={choisis.length === 0}
          className="font-display rounded-2xl border border-white bg-white/80 px-5 py-3 text-base font-bold text-ink transition hover:bg-white disabled:opacity-40"
        >
          Recommencer
        </button>
      </div>

      {verifie && (
        <div className="mt-4 rounded-2xl border border-white/70 bg-mist/60 p-4">
          <p className="font-display mb-3 font-bold">
            {juste
              ? "Bravo !"
              : choisis.length < mot.length
                ? "Il manque des lettres. Continue."
                : "Bien essayé ! Regarde le modèle."}
          </p>
          {(juste || choisis.length === mot.length) && (
            <>
              <p className="mb-2 text-xs font-bold tracking-wide text-inksoft uppercase">
                Le modèle
              </p>
              <BlocsSons analyse={analyse} taille="sm" etiquettes />
            </>
          )}
        </div>
      )}
    </div>
  );
}
