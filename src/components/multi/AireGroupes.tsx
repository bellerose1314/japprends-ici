import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Zone de manipulation : des jetons que l'enfant glisse dans des groupes.
 * Fonctionne à la souris et au doigt (événements « pointer »).
 * Un jeton peut être déplacé d'un groupe à l'autre, ou revenir dans la réserve.
 */

type Emplacement = "reserve" | number; // numéro du groupe

export type AireGroupesProps = {
  nbGroupes: number;
  nbJetons: number;
  /** Signale le contenu de chaque groupe (nombre de jetons). */
  onChange?: (comptes: number[]) => void;
  /** Change cette valeur pour tout remettre dans la réserve. */
  cleReset?: string;
};

export function AireGroupes({ nbGroupes, nbJetons, onChange, cleReset = "" }: AireGroupesProps) {
  const [emplacements, setEmplacements] = useState<Emplacement[]>(() =>
    Array.from({ length: nbJetons }, () => "reserve" as Emplacement),
  );
  const [glisse, setGlisse] = useState<{ id: number; x: number; y: number } | null>(null);

  const groupeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reserveRef = useRef<HTMLDivElement | null>(null);
  const emplacementsRef = useRef(emplacements);
  emplacementsRef.current = emplacements;

  // Remise à zéro quand l'exercice change.
  useEffect(() => {
    setEmplacements(Array.from({ length: nbJetons }, () => "reserve" as Emplacement));
  }, [nbJetons, nbGroupes, cleReset]);

  const comptes = useMemo(() => {
    const total = Array.from({ length: nbGroupes }, () => 0);
    for (const e of emplacements) {
      if (typeof e === "number" && e < nbGroupes) total[e] = (total[e] ?? 0) + 1;
    }
    return total;
  }, [emplacements, nbGroupes]);

  useEffect(() => {
    onChange?.(comptes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comptes.join(",")]);

  const deposer = useCallback(
    (id: number, x: number, y: number) => {
      let cible: Emplacement = emplacementsRef.current[id] ?? "reserve";
      for (let i = 0; i < nbGroupes; i++) {
        const rect = groupeRefs.current[i]?.getBoundingClientRect();
        if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          cible = i;
        }
      }
      const rRect = reserveRef.current?.getBoundingClientRect();
      if (rRect && x >= rRect.left && x <= rRect.right && y >= rRect.top && y <= rRect.bottom) {
        cible = "reserve";
      }
      setEmplacements((anciens) => {
        const copie = [...anciens];
        copie[id] = cible;
        return copie;
      });
    },
    [nbGroupes],
  );

  useEffect(() => {
    if (!glisse) return;
    const bouger = (e: PointerEvent) => {
      setGlisse((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
    };
    const lacher = (e: PointerEvent) => {
      deposer(glisse.id, e.clientX, e.clientY);
      setGlisse(null);
    };
    window.addEventListener("pointermove", bouger, { passive: false });
    window.addEventListener("pointerup", lacher);
    window.addEventListener("pointercancel", lacher);
    return () => {
      window.removeEventListener("pointermove", bouger);
      window.removeEventListener("pointerup", lacher);
      window.removeEventListener("pointercancel", lacher);
    };
  }, [glisse, deposer]);

  const jetonsDe = (ou: Emplacement) =>
    emplacements.map((e, i) => (e === ou ? i : -1)).filter((i) => i >= 0);

  const commencer = (id: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    setGlisse({ id, x: e.clientX, y: e.clientY });
  };

  const Jeton = ({ id }: { id: number }) => (
    <button
      type="button"
      aria-label={`jeton ${id + 1}`}
      onPointerDown={commencer(id)}
      className="size-9 touch-none select-none rounded-full border-2 border-white bg-[var(--son-o)] shadow-sm transition-transform active:scale-95 sm:size-10"
      style={{ opacity: glisse?.id === id ? 0.3 : 1 }}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-center gap-4">
        {Array.from({ length: nbGroupes }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              groupeRefs.current[i] = el;
            }}
            className="flex min-h-36 w-32 flex-col items-center justify-between gap-2 rounded-3xl border-2 border-dashed border-ink/20 bg-white/60 p-3 sm:w-36"
          >
            <div className="flex flex-wrap content-start justify-center gap-2">
              {jetonsDe(i).map((id) => (
                <Jeton key={id} id={id} />
              ))}
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-base font-bold text-ink">
              {comptes[i]}
            </span>
          </div>
        ))}
      </div>

      <div
        ref={reserveRef}
        className="flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-3xl bg-secondary/60 p-4"
      >
        {jetonsDe("reserve").map((id) => (
          <Jeton key={id} id={id} />
        ))}
        {jetonsDe("reserve").length === 0 && (
          <span className="text-sm text-inksoft">tous les jetons sont placés</span>
        )}
      </div>

      {glisse && (
        <div
          className="pointer-events-none fixed z-50 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--son-o)] shadow-lg"
          style={{ left: glisse.x, top: glisse.y }}
        />
      )}
    </div>
  );
}
