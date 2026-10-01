import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { BlocsSons } from "@/components/BlocsSons";
import { Groupes } from "@/components/multi/Ui";
import { JeComplete, JeConstruis } from "@/components/verbes/Activites";
import { supabase } from "@/integrations/supabase/client";
import { enfantActifId } from "@/lib/multi/progres";
import { analyserMot } from "@/lib/phonetique/segmenter";
import { LISTE_DE_MOTS } from "@/lib/phonetique/mots";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";
import { lireProgramme, nombreExercices, noterReponse, type Programme } from "@/lib/parent/seance";
import { VERBES, auHasard, melanger } from "@/lib/verbes/donnees";

export const Route = createFileRoute("/seance")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Séance de pratique — J'apprends ici" },
      { name: "description", content: "Une courte séance de pratique préparée par le parent." },
      { property: "og:title", content: "Séance de pratique — J'apprends ici" },
      { property: "og:description", content: "Pratiquer à la maison, à son rythme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Seance,
});

/** Mode enfant : aucune option adulte, aucun chronomètre, seulement l'activité. */
function Seance() {
  const [prog, setProg] = useState<Programme | null>(null);
  const [mots, setMots] = useState<string[]>(LISTE_DE_MOTS);
  const [numero, setNumero] = useState(0);
  const [reussi, setReussi] = useState(false);
  const [total, setTotal] = useState(10);

  useEffect(() => {
    const p = lireProgramme();
    setProg(p);
    setTotal(nombreExercices(p.duree));
    const id = enfantActifId();
    if (p.matiere === "vocabulaire" && id) {
      supabase
        .from("mots")
        .select("mot")
        .eq("enfant_id", id)
        .then(({ data }) => {
          if (data && data.length > 0) setMots(data.map((d) => d.mot));
        });
    }
  }, []);

  if (!prog) return null;
  const fini = numero >= total;

  return (
    <div className="min-h-screen w-full bg-background font-sans text-ink">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {!fini && (
          <div className="mb-6 flex justify-center gap-1.5" aria-label={`exercice ${numero + 1} sur ${total}`}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={`size-3 rounded-full ${i < numero ? "bg-ink" : "bg-ink/15"}`} />
            ))}
          </div>
        )}
        <section className="glass rounded-4xl border border-white bg-card/80 p-6 shadow-sm sm:p-10">
          {fini ? (
            <div className="text-center">
              <p className="font-display text-4xl font-extrabold sm:text-5xl">Belle pratique ! 🌟</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTotal((t) => t + 5);
                    setReussi(false);
                  }}
                  className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white"
                >
                  Continuer
                </button>
                <Link
                  to="/parent"
                  className="rounded-2xl border border-white bg-white/80 px-6 py-4 text-lg font-extrabold"
                >
                  Terminer la séance
                </Link>
              </div>
            </div>
          ) : (
            <Exercice
              key={numero}
              prog={prog}
              mots={mots}
              numero={numero}
              onReussi={() => setReussi(true)}
            />
          )}
          {!fini && reussi && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setNumero((n) => n + 1);
                  setReussi(false);
                }}
                className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white"
              >
                suivant →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Note seulement la première tentative de chaque exercice. */
function usePremiereTentative(notion: string) {
  const [note, setNote] = useState(false);
  return (ok: boolean) => {
    if (note) return;
    setNote(true);
    noterReponse(notion, ok);
  };
}

function Exercice({
  prog,
  mots,
  numero,
  onReussi,
}: {
  prog: Programme;
  mots: string[];
  numero: number;
  onReussi: () => void;
}) {
  if (prog.matiere === "verbes") return <ExerciceVerbe prog={prog} numero={numero} onReussi={onReussi} />;
  if (prog.matiere === "multiplication") return <ExerciceTable prog={prog} onReussi={onReussi} />;
  return <ExerciceMot prog={prog} mots={mots} onReussi={onReussi} />;
}

function ExerciceVerbe({ prog, numero, onReussi }: { prog: Programme; numero: number; onReussi: () => void }) {
  const [verbe] = useState(() => {
    const permis = VERBES.filter((v) => prog.verbes.includes(v.infinitif));
    return auHasard(permis.length ? permis : VERBES.slice(0, 2));
  });
  const noter = usePremiereTentative(`verbe:${verbe.infinitif}:present`);
  const props = {
    verbe,
    temps: "present" as const,
    niveau: prog.aide,
    onReussi: () => {
      noter(true);
      onReussi();
    },
    onErreur: () => noter(false),
  };
  return numero % 2 === 0 ? <JeComplete {...props} /> : <JeConstruis {...props} />;
}

function ExerciceTable({ prog, onReussi }: { prog: Programme; onReussi: () => void }) {
  const [q] = useState(() => {
    const a = auHasard(prog.tables.length ? prog.tables : [2]);
    const b = 1 + Math.floor(Math.random() * 10);
    const bonne = a * b;
    const autres = [bonne + a, Math.max(0, bonne - a), bonne + 1, bonne + b].filter((x) => x !== bonne);
    return { a, b, bonne, choix: melanger([bonne, ...melanger([...new Set(autres)]).slice(0, prog.aide === 1 ? 3 : 2)]) };
  });
  const noter = usePremiereTentative(`table:${q.a}`);
  const [etat, setEtat] = useState<"attente" | "juste" | "faux">("attente");
  const [texte, setTexte] = useState("");
  const repondre = (n: number) => {
    const ok = n === q.bonne;
    noter(ok);
    setEtat(ok ? "juste" : "faux");
    if (ok) onReussi();
  };
  return (
    <div className="text-center">
      <p className="text-5xl font-extrabold sm:text-6xl">
        {q.a} × {q.b} = {etat === "juste" ? q.bonne : "?"}
      </p>
      {prog.aide === 1 && (
        <div className="mt-6">
          <Groupes a={q.a} b={q.b} taille="sm" />
          <p className="mt-2 text-base font-bold text-inksoft">
            {q.a} groupes de {q.b}
          </p>
        </div>
      )}
      {prog.aide < 3 ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {q.choix.map((c) => (
            <button
              key={c}
              type="button"
              disabled={etat === "juste"}
              onClick={() => repondre(c)}
              className="min-w-20 rounded-2xl border border-white bg-white/80 px-6 py-4 text-2xl font-extrabold shadow-sm"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="mt-8 flex justify-center gap-3"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            repondre(Number(texte));
          }}
        >
          <input
            inputMode="numeric"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            aria-label="ta réponse"
            className="w-32 rounded-2xl border border-white bg-white/90 px-4 py-4 text-center text-2xl font-extrabold"
          />
          <button type="submit" className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white">
            Vérifier
          </button>
        </form>
      )}
      <Retour etat={etat} bravo={`Bravo ! ${q.a} × ${q.b} = ${q.bonne}`} />
    </div>
  );
}

function ExerciceMot({ prog, mots, onReussi }: { prog: Programme; mots: string[]; onReussi: () => void }) {
  const [mot] = useState(() => auHasard(mots));
  const analyse = useMemo(() => analyserMot(mot), [mot]);
  const voix = useVoixDisponible();
  const noter = usePremiereTentative(`mot:${mot}`);
  const [texte, setTexte] = useState("");
  const [etat, setEtat] = useState<"attente" | "juste" | "faux">("attente");
  const [voir, setVoir] = useState(prog.aide === 1 || !voix);

  const valider = (e: FormEvent) => {
    e.preventDefault();
    const ok = texte.trim().toLowerCase() === analyse.mot;
    noter(ok);
    setEtat(ok ? "juste" : "faux");
    if (ok) onReussi();
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold">écoute, puis écris le mot.</p>
      {voix && (
        <button
          type="button"
          onClick={() => prononcer(mot)}
          className="mt-6 rounded-full border border-white bg-white/80 px-6 py-4 text-2xl font-extrabold"
        >
          🔊 écouter
        </button>
      )}
      {(voir || etat === "juste") && (
        <div className="mt-6 flex justify-center">
          <BlocsSons analyse={analyse} taille="md" />
        </div>
      )}
      {!voir && etat !== "juste" && prog.aide === 2 && (
        <button type="button" onClick={() => setVoir(true)} className="mt-4 block w-full text-base font-bold text-inksoft underline">
          💡 voir le modèle
        </button>
      )}
      <form onSubmit={valider} className="mt-8 flex flex-wrap justify-center gap-3">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="écris le mot"
          className="w-60 rounded-2xl border border-white bg-white/90 px-4 py-4 text-center text-2xl font-extrabold"
        />
        <button type="submit" disabled={etat === "juste"} className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white">
          Vérifier
        </button>
      </form>
      <Retour etat={etat} bravo="Bravo !" />
    </div>
  );
}

function Retour({ etat, bravo }: { etat: "attente" | "juste" | "faux"; bravo: string }) {
  if (etat === "attente") return null;
  return (
    <p role="status" className="mt-6 rounded-3xl border border-white bg-white/80 p-4 text-xl font-extrabold">
      {etat === "juste" ? bravo : "Essaie encore."}
    </p>
  );
}
