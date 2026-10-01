import { useMemo, useState, type ReactNode } from "react";

import {
  GROUPES_SUJETS,
  PRONOMS,
  SUJETS_PAR_PERSONNE,
  VERBES,
  auHasard,
  avecPronom,
  decouper,
  estPronom,
  formes,
  melanger,
  pronomPour,
  terminaisonInfinitif,
  type Exemple,
  type TempsId,
  type Verbe,
} from "@/lib/verbes/donnees";
import type { Niveau } from "@/lib/verbes/reglages";

export type PropsActivite = {
  verbe: Verbe;
  temps: TempsId;
  niveau: Niveau;
  onReussi?: () => void;
  onErreur?: () => void;
};

/* ---------- petits éléments communs ---------- */

export function Radical({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-2xl border-2 border-ink/15 bg-[var(--radical)] px-3 py-1">{children}</span>
  );
}
export function Terminaison({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-2xl border-2 border-dashed border-ink/25 bg-[var(--terminaison)] px-3 py-1">
      {children}
    </span>
  );
}

function Message({ etat, bravo }: { etat: "attente" | "juste" | "faux"; bravo: ReactNode }) {
  if (etat === "attente") return null;
  return (
    <p
      role="status"
      className={`mt-6 rounded-3xl border border-white p-4 text-center text-xl font-extrabold ${
        etat === "juste" ? "bg-[var(--success)]/20" : "bg-white/80"
      }`}
    >
      {etat === "juste" ? bravo : "Essaie encore. Tu peux y arriver."}
    </p>
  );
}

function Choix({
  options,
  onChoisir,
  bonne,
  fini,
}: {
  options: string[];
  onChoisir: (o: string) => void;
  bonne?: string;
  fini?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={fini}
          onClick={() => onChoisir(o)}
          className={`min-w-24 rounded-2xl border border-white px-6 py-4 text-2xl font-extrabold shadow-sm transition-transform active:scale-[0.98] ${
            fini && o === bonne ? "bg-ink text-white" : "bg-white/80 text-ink"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Saisie({ onValider, fini }: { onValider: (t: string) => void; fini: boolean }) {
  const [texte, setTexte] = useState("");
  return (
    <form
      className="mt-6 flex flex-wrap justify-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onValider(texte.trim().toLowerCase());
      }}
    >
      <input
        value={texte}
        disabled={fini}
        onChange={(e) => setTexte(e.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="ta réponse"
        className="w-56 rounded-2xl border border-white bg-white/90 px-4 py-4 text-center text-2xl font-extrabold focus:ring-4 focus:ring-ring/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={fini}
        className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white"
      >
        Vérifier
      </button>
    </form>
  );
}

/** Bouton d'aide : d'abord un indice, puis un deuxième indice — jamais la réponse. */
function Aide({ indices }: { indices: ReactNode[] }) {
  const [n, setN] = useState(0);
  return (
    <div className="mt-6 text-center">
      {n > 0 && (
        <div className="mb-3 space-y-2">
          {indices.slice(0, n).map((ind, i) => (
            <p key={i} className="rounded-2xl border border-white bg-white/70 p-3 text-lg font-bold">
              💡 {ind}
            </p>
          ))}
        </div>
      )}
      {n < indices.length && (
        <button
          type="button"
          onClick={() => setN(n + 1)}
          className="rounded-full border border-white bg-white/80 px-5 py-3 text-base font-bold text-ink"
        >
          💡 j'ai besoin d'aide
        </button>
      )}
    </div>
  );
}

function indicesPour(verbe: Verbe, pronom: string, forme: string, avecCouleurs: boolean): ReactNode[] {
  const d = decouper(verbe, forme);
  if (d) {
    return [
      <>
        {avecCouleurs ? <Radical>{d.radical}</Radical> : d.radical} + ___
      </>,
      <>
        Avec « {pronom} », pense à la terminaison « -{d.fin} ».
      </>,
    ];
  }
  return [
    <>« {verbe.infinitif} » est un verbe irrégulier : sa forme change beaucoup.</>,
    <>Ça commence par « {forme.slice(0, Math.min(2, forme.length - 1))}… ».</>,
  ];
}

function nbChoix(niveau: Niveau) {
  return niveau === 1 ? 4 : 3;
}

/** Options : la bonne réponse + des distracteurs uniques. */
function options(bonne: string, autres: string[], n: number): string[] {
  const distracteurs = melanger([...new Set(autres)].filter((a) => a !== bonne)).slice(0, n - 1);
  return melanger([bonne, ...distracteurs]);
}

/* ---------- 1. je construis ---------- */

/** Sac de personnes : chacune sort une fois avant de revenir, jamais deux fois de suite. */
let sacPersonnes: number[] = [];
let dernierePersonne = -1;
function prochainePersonne(): number {
  if (sacPersonnes.length === 0) {
    sacPersonnes = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    if (sacPersonnes[0] === dernierePersonne) sacPersonnes.push(sacPersonnes.shift()!);
  }
  dernierePersonne = sacPersonnes.shift()!;
  return dernierePersonne;
}

export function JeConstruis({ verbe, temps, niveau, onReussi, onErreur }: PropsActivite) {
  const f = formes(verbe, temps)!;
  const q = useMemo(() => {
    const personne = prochainePersonne();
    return { personne, pronom: pronomPour(personne), forme: f[personne]! };
  }, [f]);
  const [etat, setEtat] = useState<"attente" | "juste" | "faux">("attente");
  const d = decouper(verbe, q.forme);
  const couleurs = niveau < 3;
  const fini = etat === "juste";

  const repondre = (r: string) => {
    const juste = d ? r === d.fin : r === q.forme;
    setEtat(juste ? "juste" : "faux");
    if (juste) onReussi?.();
    else onErreur?.();
  };

  const opts = d
    ? options(d.fin, f.map((x) => decouper(verbe, x)?.fin ?? ""), nbChoix(niveau))
    : options(q.forme, f, nbChoix(niveau));

  const [opt] = useState(opts);

  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold">{verbe.infinitif}</p>
      {verbe.radical ? (
        <>
          <p className="mt-4 flex items-center justify-center gap-2 text-4xl font-extrabold sm:text-5xl">
            {couleurs ? <Radical>{verbe.radical}</Radical> : verbe.radical}
            <span className="text-inksoft">+</span>
            {couleurs ? <Terminaison>{terminaisonInfinitif(verbe)}</Terminaison> : terminaisonInfinitif(verbe)}
          </p>
          {couleurs && (
            <p className="mt-3 text-base font-bold text-inksoft">
              {verbe.radical} = radical · {terminaisonInfinitif(verbe)} = terminaison de l'infinitif
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-base font-bold text-inksoft">
          verbe irrégulier : on apprend ses formes une à une.
        </p>
      )}

      <p className="mt-8 text-3xl font-extrabold sm:text-4xl">
        {q.pronom} + {verbe.infinitif}
      </p>
      <p className="mt-4 flex items-center justify-center gap-2 text-4xl font-extrabold">
        {d ? (
          <>
            {couleurs ? <Radical>{d.radical}</Radical> : d.radical}
            <span className="text-inksoft">+</span>
            {fini ? (couleurs ? <Terminaison>{d.fin}</Terminaison> : d.fin) : <span className="text-inksoft">___</span>}
          </>
        ) : (
          <span className={fini ? "" : "text-inksoft"}>{fini ? q.forme : "___"}</span>
        )}
      </p>

      {niveau === 3 ? <Saisie onValider={repondre} fini={fini} /> : <Choix options={opt} onChoisir={repondre} bonne={d ? d.fin : q.forme} fini={fini} />}
      {!fini && <Aide key={q.forme + q.pronom} indices={indicesPour(verbe, q.pronom, q.forme, couleurs)} />}
      <Message
        etat={etat}
        bravo={
          <>
            Bravo ! Avec « {q.pronom} », {verbe.infinitif} devient « {avecPronom(q.pronom, q.forme)} ».
          </>
        }
      />
    </div>
  );
}

/* ---------- 2. j'associe ---------- */

export function JAssocie({ verbe, temps, onReussi }: PropsActivite) {
  const f = formes(verbe, temps)!;
  const [chips] = useState(() => melanger([...new Set(f)]));
  const [choix, setChoix] = useState<(string | null)[]>(Array(6).fill(null));
  const [ligne, setLigne] = useState(0);
  const [verifie, setVerifie] = useState(false);

  const placer = (forme: string) => {
    const n = [...choix];
    n[ligne] = forme;
    setChoix(n);
    const suivante = n.findIndex((c) => c === null);
    if (suivante >= 0) setLigne(suivante);
  };
  const toutJuste = choix.every((c, i) => c === f[i]);

  return (
    <div>
      <p className="text-center text-base font-bold text-inksoft">
        touche un pronom, puis la forme de « {verbe.infinitif} » qui va avec. une forme peut servir plusieurs fois.
      </p>
      <div className="mt-6 grid gap-3">
        {PRONOMS.map((p, i) => {
          const juste = verifie && choix[i] === f[i];
          return (
            <button
              key={p}
              type="button"
              onClick={() => !verifie && setLigne(i)}
              className={`flex items-center justify-between rounded-2xl border-2 px-5 py-3 text-2xl font-extrabold ${
                ligne === i && !verifie ? "border-ink bg-white" : "border-white bg-white/70"
              }`}
            >
              <span>{p}</span>
              <span className="flex items-center gap-3">
                <span className={choix[i] ? "" : "text-inksoft"}>{choix[i] ?? "___"}</span>
                {verifie && (juste ? <span aria-label="juste">✓</span> : <span className="text-base text-inksoft">→ {f[i]}</span>)}
              </span>
            </button>
          );
        })}
      </div>
      {!verifie && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => placer(c)}
              className="rounded-2xl border border-white bg-white/80 px-5 py-3 text-2xl font-extrabold shadow-sm active:scale-[0.98]"
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-center gap-3">
        {!verifie ? (
          <button
            type="button"
            disabled={choix.some((c) => c === null)}
            onClick={() => {
              setVerifie(true);
              if (choix.every((c, i) => c === f[i])) onReussi?.();
            }}
            className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white disabled:opacity-50"
          >
            Vérifier
          </button>
        ) : (
          !toutJuste && (
            <button
              type="button"
              onClick={() => {
                setVerifie(false);
                setChoix(choix.map((c, i) => (c === f[i] ? c : null)));
                setLigne(Math.max(0, choix.findIndex((c, i) => c !== f[i])));
              }}
              className="rounded-2xl border border-white bg-white/80 px-6 py-4 text-lg font-extrabold"
            >
              Réessayer
            </button>
          )
        )}
      </div>
      {verifie && (
        <Message etat={toutJuste ? "juste" : "faux"} bravo="Bravo ! Toutes les associations sont justes." />
      )}
    </div>
  );
}

/* ---------- 3. je complète ---------- */

/** Série de 20 phrases toutes différentes : chaque personne (je, tu, il/elle,
 *  nous, vous, ils/elles) est pratiquée au moins 3 fois ; une phrase revient
 *  uniquement si l'élève s'est trompé. */
type SacCompletes = { serie: Exemple[]; position: number; dernierFaux: number | null };
const sacsCompletes = new Map<string, SacCompletes>();

function cleSac(verbe: Verbe, temps: TempsId, niveau: Niveau) {
  return `${verbe.infinitif}-${temps}-${niveau}`;
}

function poolExemples(verbe: Verbe): Exemple[] {
  return [...verbe.exemples, ...(verbe.plus ?? [])];
}

function exemplePour(verbe: Verbe, personne: number, deja: Set<string>): Exemple {
  const pool = poolExemples(verbe);
  const sujets =
    personne <= 1
      ? [PRONOMS[personne]!]
      : melanger(SUJETS_PAR_PERSONNE[personne] ?? [PRONOMS[personne]!]);
  const suites = [...new Set(pool.filter((e) => e.personne === personne).map((e) => e.suite))];
  if (personne <= 1 && suites.length < 3) {
    // complète avec des suites d'exemples à pronom sujet (je, tu, il, elle)
    for (const e of pool) {
      if (estPronom(e.sujet) && e.personne <= 2 && !suites.includes(e.suite)) suites.push(e.suite);
    }
  }
  for (const sujet of sujets) {
    for (const suite of suites) {
      const cle = `${sujet}|${suite}`;
      if (!deja.has(cle)) {
        deja.add(cle);
        return { sujet, personne, suite };
      }
    }
  }
  return { sujet: sujets[0]!, personne, suite: suites[Math.floor(Math.random() * suites.length)]! };
}

function construireSerie(verbe: Verbe): Exemple[] {
  // je et tu trois fois ; il/elle, nous, vous, ils/elles trois fois + deux tours de plus
  const personnes = melanger([
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3, 4, 5,
    0, 1, 2, 3, 4, 5,
    ...melanger([2, 3, 4, 5]).slice(0, 2),
  ]);
  // jamais la même personne deux fois de suite
  for (let i = 1; i < personnes.length; i++) {
    if (personnes[i] === personnes[i - 1]) {
      const j = personnes.findIndex(
        (p, k) => k > i + 1 && p !== personnes[i] && personnes[k - 1] !== personnes[i],
      );
      if (j > i) {
        const t = personnes[i]!;
        personnes[i] = personnes[j]!;
        personnes[j] = t;
      }
    }
  }
  const deja = new Set<string>();
  return personnes.map((p) => exemplePour(verbe, p, deja));
}

export function JeComplete({ verbe, temps, niveau, onReussi, onErreur }: PropsActivite) {
  const f = formes(verbe, temps)!;
  const cle = cleSac(verbe, temps, niveau);
  const [{ ex, idx, opt }] = useState(() => {
    let sac = sacsCompletes.get(cle);
    if (!sac || sac.position >= sac.serie.length) {
      sac = { serie: construireSerie(verbe), position: 0, dernierFaux: null };
      sacsCompletes.set(cle, sac);
      console.log("SERIE-COMPLETE", sac.serie.map((e) => `${e.sujet}|${e.personne}|${e.suite}`).join(" ;; "));
    }
    const idx = sac.dernierFaux ?? sac.position;
    const ex = sac.serie[idx]!;
    const bonne = f[ex.personne]!;
    return { ex, idx, opt: options(bonne, f, nbChoix(niveau)) };
  });
  const bonne = f[ex.personne]!;
  const [etat, setEtat] = useState<"attente" | "juste" | "faux">("attente");
  const fini = etat === "juste";
  const pronomEquivalent = PRONOMS[ex.personne]!;
  const sujetAffiche = ex.sujet.toLowerCase() === "je" && /^[aeéèêiouyh]/i.test(bonne) && fini ? "J'" : ex.sujet;

  const repondre = (r: string) => {
    const juste = r === bonne;
    setEtat(juste ? "juste" : "faux");
    const sac = sacsCompletes.get(cle);
    if (juste) {
      // la série n'avance qu'après une bonne réponse
      if (sac) {
        sac.dernierFaux = null;
        sac.position = idx + 1;
      }
      onReussi?.();
    } else {
      if (sac) sac.dernierFaux = idx;
      onErreur?.();
    }
  };

  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold leading-relaxed sm:text-4xl">
        {sujetAffiche.charAt(0).toUpperCase() + sujetAffiche.slice(1)}{sujetAffiche.endsWith("'") ? "" : " "}
        <span className={`inline-block min-w-28 border-b-4 border-ink/30 ${fini ? "" : "text-inksoft"}`}>
          {fini ? bonne : "\u00a0"}
        </span>{" "}
        {ex.suite}
      </p>
      <p className="mt-3 text-xl font-bold text-inksoft">({verbe.infinitif})</p>
      {!estPronom(ex.sujet) && niveau < 3 && (
        <p className="mt-3 text-base font-bold text-inksoft">
          indice : « {ex.sujet} », c'est comme « {pronomEquivalent} ».
        </p>
      )}
      {niveau === 3 ? <Saisie onValider={repondre} fini={fini} /> : <Choix options={opt} onChoisir={repondre} bonne={bonne} fini={fini} />}
      {!fini && <Aide indices={indicesPour(verbe, pronomEquivalent, bonne, niveau < 3)} />}
      <Message
        etat={etat}
        bravo={
          estPronom(ex.sujet) ? (
            <>Bravo !</>
          ) : (
            <>
              Bravo ! « {ex.sujet} » = « {pronomEquivalent} », donc « {bonne} ».
            </>
          )
        }
      />
    </div>
  );
}

/* ---------- 4. je trouve le pronom ---------- */

/** Sac de groupes : chaque groupe ne sort qu'une fois par série, et un
 *  « je » est toujours placé parmi les 20 premières questions. */
const sacPronom: { restants: number[]; position: number } = { restants: [], position: 0 };

function remplirSacPronom() {
  sacPronom.restants = melanger(GROUPES_SUJETS.map((_, i) => i));
  sacPronom.position = 0;
  const idxJe = GROUPES_SUJETS.findIndex((g) => g.personne === 0);
  const positionJe = sacPronom.restants.indexOf(idxJe);
  if (idxJe >= 0 && positionJe >= 20) {
    const position = Math.floor(Math.random() * 20);
    sacPronom.restants[positionJe] = sacPronom.restants[position]!;
    sacPronom.restants[position] = idxJe;
  }
  console.log("SERIE-PRONOM", sacPronom.restants.slice(0, 20).map((i) => GROUPES_SUJETS[i]!.groupe).join(" ;; "));
}

export function JeTrouveLePronom({ onReussi }: { onReussi?: () => void }) {
  const [idx] = useState(() => {
    if (sacPronom.restants.length === 0 || sacPronom.position >= 20) remplirSacPronom();
    return sacPronom.position;
  });
  const q = GROUPES_SUJETS[sacPronom.restants[idx]!]!;
  const [etat, setEtat] = useState<"attente" | "juste" | "faux">("attente");
  const fini = etat === "juste";
  return (
    <div className="text-center">
      <p className="text-base font-bold text-inksoft">quel pronom remplace ce groupe ?</p>
      <p className="mt-4 text-4xl font-extrabold sm:text-5xl">« {q.groupe} »</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRONOMS.map((p, i) => (
          <button
            key={p}
            type="button"
            disabled={fini}
            onClick={() => {
              const juste = i === q.personne;
              setEtat(juste ? "juste" : "faux");
              if (juste) {
                sacPronom.position++;
                onReussi?.();
              }
            }}
            className={`rounded-2xl border border-white px-4 py-4 text-2xl font-extrabold shadow-sm active:scale-[0.98] ${
              fini && i === q.personne ? "bg-ink text-white" : "bg-white/80"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <Message etat={etat} bravo={<>Bravo ! {q.raison}</>} />
    </div>
  );
}

/* ---------- 5. je repère ---------- */

export function JeRepere({ verbe, temps, onReussi }: PropsActivite) {
  const f = formes(verbe, temps)!;
  const [ex] = useState(() => auHasard(verbe.exemples));
  const forme = f[ex.personne]!;
  const elision = ex.sujet.toLowerCase() === "je" && /^[aeéèêiouyh]/i.test(forme);
  const mots = [
    ...(elision ? [] : ex.sujet.split(" ")),
    elision ? `J'${forme}` : forme,
    ...ex.suite.split(" "),
  ].map((m, i) => (i === 0 ? m.charAt(0).toUpperCase() + m.slice(1) : m));
  const indexVerbe = elision ? 0 : ex.sujet.split(" ").length;

  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [faux, setFaux] = useState(false);
  const [opt] = useState(() =>
    melanger([verbe.infinitif, forme, auHasard(VERBES.filter((v) => v !== verbe)).infinitif]),
  );

  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold">{etape === 1 ? "touche le verbe." : "quel est le verbe utilisé ?"}</p>
      <p className="mt-6 flex flex-wrap justify-center gap-2 text-3xl font-extrabold sm:text-4xl">
        {mots.map((m, i) => (
          <button
            key={i}
            type="button"
            disabled={etape !== 1}
            onClick={() => {
              if (i === indexVerbe) {
                setEtape(2);
                setFaux(false);
              } else setFaux(true);
            }}
            className={`rounded-2xl px-3 py-2 ${
              etape > 1 && i === indexVerbe ? "bg-[var(--terminaison)]" : "bg-white/60"
            }`}
          >
            {m}
          </button>
        ))}
      </p>
      {etape === 2 && (
        <Choix
          options={opt}
          onChoisir={(o) => {
            if (o === verbe.infinitif) {
              setEtape(3);
              setFaux(false);
              onReussi?.();
            } else setFaux(true);
          }}
        />
      )}
      {faux && <Message etat="faux" bravo="" />}
      {etape === 3 && (
        <Message
          etat="juste"
          bravo={
            <>
              Bravo ! {forme} → {verbe.infinitif}
            </>
          }
        />
      )}
    </div>
  );
}
