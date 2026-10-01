import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { ajouterEnfant } from "@/lib/mesmots.functions";
import { useProgres } from "@/lib/multi/progres";
import { useReglages, type NomActivite } from "@/lib/multi/reglages";
import { useSessionEnfant } from "@/lib/multi/session";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "J'apprends ici — lire et calculer en manipulant" },
      {
        name: "description",
        content:
          "Une application douce pour le primaire : manipuler des jetons pour comprendre l'addition, la soustraction, la multiplication et la division, et découvrir les sons des mots.",
      },
      { property: "og:title", content: "J'apprends ici — lire et calculer en manipulant" },
      {
        property: "og:description",
        content:
          "Lire les sons et manipuler les nombres : des jetons et des mots à découvrir, une étape à la fois.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

const OPERATIONS: Array<{
  cles: NomActivite[];
  vers: "/addition" | "/soustraction" | "/multiplication" | "/division";
  emoji: string;
  titre: string;
  sous: string;
}> = [
  {
    cles: ["addition"],
    vers: "/addition",
    emoji: "➕",
    titre: "J'additionne",
    sous: "je mets les jetons ensemble",
  },
  {
    cles: ["soustraction"],
    vers: "/soustraction",
    emoji: "➖",
    titre: "Je soustrais",
    sous: "j'enlève des jetons",
  },
  {
    cles: ["manipule", "represente", "comprends", "pratique"],
    vers: "/multiplication",
    emoji: "✖️",
    titre: "Je multiplie",
    sous: "des groupes de jetons — 4 activités",
  },
  {
    cles: ["division"],
    vers: "/division",
    emoji: "➗",
    titre: "Je partage",
    sous: "je partage en groupes égaux",
  },
];

function Accueil() {
  const [reglages] = useReglages();
  const { etoiles } = useProgres();
  const { user, chargement, enfants, actif, choisir, rafraichir } = useSessionEnfant();
  const enfantCourant = enfants.find((e) => e.id === actif) ?? null;

  return (
    <div className="min-h-screen w-full bg-background font-sans text-ink">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="text-center">
          <h1 className="font-display text-4xl font-extrabold sm:text-6xl">j'apprends ici</h1>
          <p className="mt-3 text-lg text-inksoft sm:text-xl">
            je lis et je calcule, une étape à la fois.
          </p>
          {etoiles > 0 && (
            <p className="mt-4 inline-block rounded-full border border-white bg-white/80 px-5 py-2 text-lg font-extrabold">
              ⭐ {etoiles} {etoiles > 1 ? "étoiles" : "étoile"}
            </p>
          )}
          {enfantCourant && (
            <p className="mt-2 text-base font-bold text-inksoft">
              session de {enfantCourant.prenom} — progression enregistrée
            </p>
          )}
        </header>

        {!chargement && user && (
          <div className="glass mt-6 rounded-4xl border border-white bg-card/80 p-5 sm:p-6">
            <p className="text-center text-base font-bold text-inksoft">qui joue ?</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {enfants.map((enfant) => (
                <button
                  key={enfant.id}
                  type="button"
                  onClick={() => void choisir(enfant.id)}
                  className={
                    enfant.id === actif
                      ? "rounded-full bg-ink px-5 py-2.5 text-base font-extrabold text-white"
                      : "rounded-full border border-white bg-white/70 px-5 py-2.5 text-base font-bold text-ink"
                  }
                >
                  {enfant.prenom}
                </button>
              ))}
              {enfants.length > 0 && (
                <button
                  type="button"
                  onClick={() => void choisir(null)}
                  className={
                    actif === null
                      ? "rounded-full bg-ink px-5 py-2.5 text-base font-extrabold text-white"
                      : "rounded-full border border-white bg-white/70 px-5 py-2.5 text-base font-bold text-ink"
                  }
                >
                  sur cet appareil
                </button>
              )}
              <AjouterProfil onCree={rafraichir} />
            </div>
          </div>
        )}

        {!chargement && !user && (
          <p className="mt-6 text-center text-base font-bold text-inksoft">
            <Link
              to="/auth"
              className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              connecte-toi
            </Link>{" "}
            pour créer un profil et enregistrer les mots et la progression.
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:mt-14 lg:grid-cols-2">
          <section className="glass rounded-4xl border border-white bg-card/80 p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">📐 mathématique</h2>
            <p className="mt-1 text-base text-inksoft">je manipule les jetons.</p>
            <div className="mt-5 grid gap-3">
              {OPERATIONS.filter((o) => o.cles.some((c) => reglages.activites[c])).map((o) => (
                <Link
                  key={o.vers}
                  to={o.vers}
                  className="flex items-center gap-4 rounded-3xl border border-white bg-white/70 p-5 text-left transition-transform active:scale-[0.99]"
                >
                  <span className="text-3xl sm:text-4xl">{o.emoji}</span>
                  <span>
                    <span className="block text-xl font-extrabold sm:text-2xl">{o.titre}</span>
                    <span className="block text-base text-inksoft">{o.sous}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="glass rounded-4xl border border-white bg-card/80 p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">📖 français</h2>
            <p className="mt-1 text-base text-inksoft">les sons des mots, en couleur.</p>
            <Link
              to="/mots"
              className="mt-5 block rounded-3xl border border-white bg-white/70 p-5 transition-transform active:scale-[0.99]"
            >
              <span className="flex items-center gap-4">
                <span className="text-3xl sm:text-4xl">🔤</span>
                <span>
                  <span className="block text-xl font-extrabold sm:text-2xl">mes mots</span>
                  <span className="block text-base text-inksoft">j'écris un mot, je vois ses sons</span>
                </span>
              </span>
              <span className="mt-4 block border-t border-ink/10 pt-4 text-base font-bold text-inksoft">
                👀 je découvre mon mot
                <br />🧩 à toi de séparer les sons
                <br />✏️ j'écris mon mot
                <br />🔠 j'épelle
              </span>
            </Link>
            <Link
              to="/verbes"
              className="mt-3 flex items-center gap-4 rounded-3xl border border-white bg-white/70 p-5 transition-transform active:scale-[0.99]"
            >
              <span className="text-3xl sm:text-4xl">✏️</span>
              <span>
                <span className="block text-xl font-extrabold sm:text-2xl">je pratique les verbes</span>
                <span className="block text-base text-inksoft">je construis et je conjugue</span>
              </span>
            </Link>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/parent"
            className="rounded-full border border-white bg-white/70 px-5 py-3 text-base font-bold text-inksoft"
          >
            👨‍👩‍👧 espace parent
          </Link>
          <Link
            to="/enseignant"
            className="rounded-full border border-white bg-white/70 px-5 py-3 text-base font-bold text-inksoft"
          >
            ⚙️ espace enseignant
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Ajout d'un profil d'enfant directement depuis l'accueil. */
function AjouterProfil({ onCree }: { onCree: () => void }) {
  const fn = useServerFn(ajouterEnfant);
  const [ouvert, setOuvert] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    if (!prenom.trim()) return;
    setEnCours(true);
    try {
      await fn({ data: { prenom } });
      setPrenom("");
      setOuvert(false);
      onCree();
    } finally {
      setEnCours(false);
    }
  };

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-full border border-dashed border-ink/25 px-5 py-2.5 text-base font-bold text-inksoft transition hover:border-ink/50 hover:text-ink"
      >
        + ajouter un profil
      </button>
    );
  }
  return (
    <form onSubmit={soumettre} className="flex items-center gap-2">
      <input
        autoFocus
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Prénom"
        maxLength={40}
        className="w-36 rounded-full border border-white bg-white/80 px-4 py-2.5 text-base font-bold text-ink placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={enCours}
        className="rounded-full bg-ink px-4 py-2.5 text-base font-extrabold text-white disabled:opacity-60"
      >
        {enCours ? "…" : "OK"}
      </button>
      <button type="button" onClick={() => setOuvert(false)} className="font-semibold text-inksoft">
        annuler
      </button>
    </form>
  );
}
