import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { AToiDeSeparer } from "@/components/AToiDeSeparer";
import { BlocsSons } from "@/components/BlocsSons";
import { CompteMenu } from "@/components/CompteMenu";
import { EspaceFamille } from "@/components/EspaceFamille";
import { JEcris } from "@/components/JEcris";
import { JEpelle } from "@/components/JEpelle";
import { ajouterMot, listerEnfants } from "@/lib/mesmots.functions";
import { LISTE_DE_MOTS } from "@/lib/phonetique/mots";
import { analyserMot } from "@/lib/phonetique/segmenter";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/mots/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Mes mots — apprendre les sons du français en couleur" },
      {
        name: "description",
        content:
          "Entre un mot et découvre ses sons en couleur. Trois activités douces pour apprendre le vocabulaire au primaire.",
      },
      { property: "og:title", content: "Mes mots — les sons du français en couleur" },
      {
        property: "og:description",
        content:
          "Un mot, ses graphèmes colorés et trois petites activités : Je découvre, À toi de séparer, J'écris.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MesMots,
});

type Activite = "decouvre" | "separe" | "ecris" | "epelle";

function MesMots() {
  const [saisie, setSaisie] = useState("chapeau");
  const [mot, setMot] = useState("chapeau");
  const [activite, setActivite] = useState<Activite>("decouvre");
  const [enfantId, setEnfantId] = useState<string | null>(null);
  const voix = useVoixDisponible();
  const { user, chargement: sessionEnCours } = useSession();
  const queryClient = useQueryClient();

  const fetchEnfants = useServerFn(listerEnfants);
  const enfantsQ = useQuery({
    queryKey: ["enfants"],
    queryFn: () => fetchEnfants(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!enfantId) {
      const premier = enfantsQ.data?.[0];
      if (premier) setEnfantId(premier.id);
    }
  }, [enfantId, enfantsQ.data]);

  const analyse = useMemo(() => analyserMot(mot), [mot]);

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    setMot(saisie);
  };

  const choisirMot = (nouveau: string) => {
    setSaisie(nouveau);
    setMot(nouveau);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden font-sans text-ink">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glow grid size-12 place-items-center rounded-2xl border border-white bg-white/70 text-2xl">
              🔤
            </div>
            <div>
              <p className="font-display text-xl leading-none font-extrabold">Mes mots</p>
              <p className="text-sm font-semibold text-inksoft">
                Les sons du français, en couleur
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="glass rounded-full border border-white px-4 py-2 text-sm font-bold text-inksoft"
            >
              ← accueil
            </Link>
            <span className="glass hidden items-center gap-2 rounded-full border border-white px-4 py-2 text-sm font-semibold text-inksoft md:flex">
              <span className="size-2.5 rounded-full bg-success" /> Les sons en couleur
            </span>
            <CompteMenu />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="glass glow rounded-3xl border border-white p-6 sm:p-8 lg:col-span-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
                  Découvre un mot
                </h1>
                <p className="mt-1 font-medium text-inksoft">
                  Écris un mot, regarde ses sons s'assembler.
                </p>
              </div>
              {voix && (
                <button
                  type="button"
                  onClick={() => prononcer(analyse.mot)}
                  className="font-display inline-flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-lg font-bold text-white transition hover:bg-ink/90"
                >
                  🔊 <span className="hidden sm:inline">Écouter</span>
                </button>
              )}
            </div>

            <form onSubmit={soumettre} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Écris ton mot"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="font-display flex-1 rounded-2xl border border-white bg-white/80 px-5 py-4 text-xl font-bold lowercase text-ink placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
              />
              <button
                type="submit"
                className="font-display rounded-2xl bg-secondary px-6 py-4 text-lg font-extrabold whitespace-nowrap text-ink transition hover:brightness-95"
              >
                Découvrir mon mot
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-white/70 bg-mist/60 p-5 sm:p-6">
              <p className="mb-3 text-sm font-bold tracking-wide text-inksoft uppercase">
                Le mot
              </p>
              {analyse.mot ? (
                <>
                  <p className="font-display mb-4 text-5xl font-extrabold tracking-tight lowercase sm:text-6xl">
                    {analyse.mot}
                  </p>
                  <BlocsSons analyse={analyse} taille="md" etiquettes />
                  {user && enfantId && (
                    <GarderMot
                      enfantId={enfantId}
                      mot={analyse.mot}
                      onAjoute={() => queryClient.invalidateQueries({ queryKey: ["mots", enfantId] })}
                    />
                  )}
                </>
              ) : (
                <p className="font-medium text-inksoft">
                  Écris un mot pour voir ses sons.
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ChoixActivite
                emoji="👀"
                titre="Je découvre"
                sous="Voir les sons"
                actif={activite === "decouvre"}
                onClick={() => setActivite("decouvre")}
              />
              <ChoixActivite
                emoji="🧩"
                titre="À toi de séparer"
                sous="Trouver les groupes"
                actif={activite === "separe"}
                onClick={() => setActivite("separe")}
              />
              <ChoixActivite
                emoji="✏️"
                titre="J'écris"
                sous="Recopier le mot"
                actif={activite === "ecris"}
                onClick={() => setActivite("ecris")}
              />
              <ChoixActivite
                emoji="🔠"
                titre="J'épelle"
                sous="Lettre par lettre"
                actif={activite === "epelle"}
                onClick={() => setActivite("epelle")}
              />
            </div>
          </section>

          <aside className="flex flex-col gap-4 lg:col-span-5">
            <AToiDeSeparer analyse={analyse} actif={activite === "separe"} />
            <JEcris analyse={analyse} actif={activite === "ecris"} />
            <JEpelle analyse={analyse} actif={activite === "epelle"} />
          </aside>

          <section className="glass glow rounded-3xl border border-white p-6 sm:p-8 lg:col-span-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold">Mes mots</h2>
              {!user && !sessionEnCours && (
                <span className="text-sm font-semibold text-inksoft">
                  Exemples · {" "}
                  <Link to="/auth" className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                    crée un compte
                  </Link>{" "}
                  pour garder tes propres mots
                </span>
              )}
            </div>
            {user ? (
              <EspaceFamille
                enfantId={enfantId}
                choisirEnfant={(id) => setEnfantId(id || null)}
                onChoisirMot={choisirMot}
                motActif={analyse.mot}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {LISTE_DE_MOTS.map((m) => {
                  const a = analyserMot(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => choisirMot(m)}
                      className={`rounded-2xl border bg-white/70 p-4 text-left transition hover:bg-white ${
                        m === analyse.mot ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
                      }`}
                    >
                      <p className="font-display mb-2 text-lg font-extrabold lowercase">{m}</p>
                      <BlocsSons analyse={a} taille="sm" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-6 text-center text-sm font-medium text-inksoft">
          Les correspondances son ↔ couleur sont modifiables · fait avec soin pour les petits lecteurs
        </footer>
      </div>
    </div>
  );
}

/** Garde le mot découvert dans la liste de l'enfant choisi. */
function GarderMot({
  enfantId,
  mot,
  onAjoute,
}: {
  enfantId: string;
  mot: string;
  onAjoute: () => void;
}) {
  const fn = useServerFn(ajouterMot);
  const [note, setNote] = useState<string | null>(null);

  const garder = async () => {
    const res = await fn({ data: { enfantId, mot } });
    setNote(res.deja ? "Déjà dans la liste" : "Ajouté ✓");
    onAjoute();
    setTimeout(() => setNote(null), 2500);
  };

  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={garder}
        className="font-display inline-flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-4 py-2.5 font-bold text-ink transition hover:bg-white"
      >
        ☆ Ajouter ce mot à ma liste
      </button>
      {note && <span className="text-sm font-bold text-inksoft">{note}</span>}
    </div>
  );
}

function ChoixActivite({
  emoji,
  titre,
  sous,
  actif,
  onClick,
}: {
  emoji: string;
  titre: string;
  sous: string;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`rounded-2xl border bg-white/80 p-4 text-left transition hover:bg-white ${
        actif ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="font-display mt-2 font-bold">{titre}</p>
      <p className="text-sm font-medium text-inksoft">{sous}</p>
    </button>
  );
}
