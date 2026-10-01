import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CompteurEtoiles } from "@/components/multi/Etoiles";
import { prononcer, useVoixDisponible } from "@/lib/phonetique/voix";

/** Éléments communs aux activités : mise en page, consigne, boutons. */

export function BoutonHaut({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <Link
        to="/"
        className="rounded-full border border-white bg-white/70 px-4 py-2 text-base font-bold text-ink"
      >
        ← accueil
      </Link>
      <span className="flex items-center gap-3">
        <CompteurEtoiles />
        <span className="text-right text-base font-bold text-inksoft">{children}</span>
      </span>
    </div>
  );
}

export function Page({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background font-sans text-ink">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <BoutonHaut>{titre}</BoutonHaut>
        {children}
      </div>
    </div>
  );
}

export function Consigne({ texte, audio }: { texte: string; audio: boolean }) {
  const voix = useVoixDisponible();
  return (
    <div className="flex items-center justify-center gap-3 text-center">
      <p className="text-2xl font-extrabold leading-snug sm:text-3xl">{texte}</p>
      {audio && voix && (
        <button
          type="button"
          aria-label="écouter la consigne"
          onClick={() => prononcer(texte)}
          className="shrink-0 rounded-full border border-white bg-white/80 px-3 py-2 text-xl"
        >
          🔊
        </button>
      )}
    </div>
  );
}

export function Bouton({
  children,
  onClick,
  variante = "principal",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variante?: "principal" | "doux";
  type?: "button" | "submit";
}) {
  const style =
    variante === "principal"
      ? "bg-ink text-white"
      : "border border-white bg-white/80 text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl px-6 py-4 text-lg font-extrabold shadow-sm transition-transform active:scale-[0.98] ${style}`}
    >
      {children}
    </button>
  );
}

export function Carte({ children }: { children: ReactNode }) {
  return (
    <section className="glass rounded-4xl border border-white bg-card/80 p-5 shadow-sm sm:p-8">
      {children}
    </section>
  );
}

/** Petite représentation en points : « a groupes de b ». */
export function Groupes({ a, b, taille = "md" }: { a: number; b: number; taille?: "sm" | "md" }) {
  const point = taille === "sm" ? "size-3" : "size-4";
  return (
    <div className="flex flex-wrap items-start justify-center gap-3">
      {Array.from({ length: a }, (_, i) => (
        <div
          key={i}
          className="flex max-w-28 flex-wrap justify-center gap-1.5 rounded-2xl border-2 border-dashed border-ink/20 bg-white/70 p-3"
        >
          {Array.from({ length: b }, (_, j) => (
            <span key={j} className={`${point} rounded-full bg-[var(--son-o)]`} />
          ))}
        </div>
      ))}
    </div>
  );
}
