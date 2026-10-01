import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { ETAPES_PARCOURS, demarrerParcours, useProgres } from "@/lib/multi/progres";
import { useReglages, type NomActivite } from "@/lib/multi/reglages";
import { Page } from "@/components/multi/Ui";

export const Route = createFileRoute("/multiplication")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je multiplie — J'apprends ici" },
      {
        name: "description",
        content:
          "Manipuler, représenter, comprendre et pratiquer la multiplication : 3 × 4, c'est 3 groupes de 4.",
      },
      { property: "og:title", content: "Je multiplie — J'apprends ici" },
      {
        property: "og:description",
        content: "Quatre activités douces pour comprendre la multiplication.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Multiplication,
});

const ACTIVITES: Array<{
  cle: NomActivite;
  vers: "/manipule" | "/represente" | "/comprends" | "/pratique";
  emoji: string;
  titre: string;
  sous: string;
}> = [
  { cle: "manipule", vers: "/manipule", emoji: "👐", titre: "Je manipule", sous: "je place les jetons dans les groupes" },
  { cle: "represente", vers: "/represente", emoji: "👀", titre: "Je représente", sous: "je choisis la bonne image" },
  { cle: "comprends", vers: "/comprends", emoji: "🧠", titre: "Je comprends", sous: "groupes, addition, multiplication" },
  { cle: "pratique", vers: "/pratique", emoji: "✏️", titre: "Je pratique", sous: "je réponds à mon rythme" },
];

function Multiplication() {
  const [reglages] = useReglages();
  const { parcours } = useProgres();
  const navigate = useNavigate();

  const parcoursEnCours = !parcours.termine && (parcours.faits > 0 || parcours.etape > 0);

  function ouvrirParcours() {
    const p = parcoursEnCours ? parcours : demarrerParcours();
    const etape = ETAPES_PARCOURS[Math.min(p.etape, ETAPES_PARCOURS.length - 1)];
    if (etape) navigate({ to: etape.vers });
  }

  return (
    <Page titre="✖️ je multiplie">
      <p className="text-center text-lg text-inksoft sm:text-xl">3 × 4, c'est 3 groupes de 4.</p>

      <div className="mt-8">
        <button
          type="button"
          onClick={ouvrirParcours}
          className="w-full rounded-4xl bg-ink p-6 text-left text-white shadow-sm transition-transform active:scale-[0.99] sm:p-8"
        >
          <span className="block text-2xl font-extrabold sm:text-3xl">
            🌈{" "}
            {parcours.termine
              ? "Refaire le parcours du jour"
              : parcoursEnCours
                ? "Continuer le parcours du jour"
                : "Le parcours du jour"}
          </span>
          <span className="mt-1 block text-base text-white/80">
            {parcours.termine
              ? "tu l'as déjà terminé aujourd'hui — bravo !"
              : "une petite routine guidée : je manipule, je représente, je pratique"}
          </span>
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {ACTIVITES.filter((a) => reglages.activites[a.cle]).map((a) => (
          <Link
            key={a.cle}
            to={a.vers}
            className="glass flex items-center gap-4 rounded-4xl border border-white bg-card/80 p-6 text-left shadow-sm transition-transform active:scale-[0.99] sm:p-8"
          >
            <span className="text-4xl sm:text-5xl">{a.emoji}</span>
            <span>
              <span className="block text-2xl font-extrabold sm:text-3xl">{a.titre}</span>
              <span className="block text-base text-inksoft">{a.sous}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Link
          to="/tables"
          className="glass flex items-center gap-4 rounded-4xl border border-white bg-card/80 p-6 text-left shadow-sm transition-transform active:scale-[0.99] sm:p-8"
        >
          <span className="text-4xl sm:text-5xl">📖</span>
          <span>
            <span className="block text-2xl font-extrabold sm:text-3xl">Les tables</span>
            <span className="block text-base text-inksoft">
              je révise les multiples de 1, de 2, de 3… jusqu'à 10
            </span>
          </span>
        </Link>
      </div>
    </Page>
  );
}
