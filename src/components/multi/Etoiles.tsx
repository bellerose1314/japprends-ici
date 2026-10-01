import { Link } from "@tanstack/react-router";

import { ETAPES_PARCOURS, useProgres } from "@/lib/multi/progres";
import type { NomActivite } from "@/lib/multi/reglages";

/** Petite pastille « ⭐ 12 » affichée en haut des pages. */
export function CompteurEtoiles() {
  const { etoiles } = useProgres();
  if (etoiles === 0) return null;
  return (
    <span className="rounded-full border border-white bg-white/80 px-4 py-2 text-base font-extrabold text-ink">
      ⭐ {etoiles}
    </span>
  );
}

/**
 * Ruban discret du parcours du jour, en haut d'une activité.
 * Indique la progression et guide vers l'étape suivante.
 */
export function BandeauParcours({ activite }: { activite: NomActivite }) {
  const { parcours } = useProgres();

  if (parcours.termine) {
    return (
      <p className="mb-6 rounded-3xl border border-white bg-secondary/50 px-5 py-3 text-center text-lg font-bold text-ink">
        🌈 parcours du jour terminé — bravo !
      </p>
    );
  }

  const enCours = parcours.faits > 0 || parcours.etape > 0;
  if (!enCours) return null;

  const etape = ETAPES_PARCOURS[parcours.etape];
  if (!etape) return null;

  if (etape.activite === activite) {
    return (
      <p className="mb-6 rounded-3xl border border-white bg-white/70 px-5 py-3 text-center text-lg font-bold text-inksoft">
        🌈 parcours du jour · étape {parcours.etape + 1} sur {ETAPES_PARCOURS.length} ·{" "}
        {parcours.faits} / {etape.but}
      </p>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-white bg-secondary/50 px-5 py-3">
      <p className="text-lg font-bold text-ink">🌈 prochaine étape du parcours :</p>
      <Link
        to={etape.vers}
        className="rounded-full bg-ink px-5 py-2 text-lg font-extrabold text-white"
      >
        {etape.emoji} {etape.titre}
      </Link>
    </div>
  );
}
