import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Zone de manipulation libre : des jetons à glisser entre plusieurs boîtes.
 * Fonctionne à la souris et au doigt (événements « pointer »).
 * Sert à l'addition (tout rassembler) et à la soustraction (enlever).
 */

export type ZoneLibre = { cle: string; titre: string };

export type AireLibreProps = {
  /** Une teinte CSS par jeton (var(--son-…)). */
  teintes: string[];
  zones: ZoneLibre[];
  /** Zone de départ de chaque jeton (clé de zone). */
  depart: string[];
  /** Change cette valeur pour tout remettre au départ. */
  cleReset?: string;
  onChange?: (comptes: Record<string, number>) => void;
};

export function AireLibre({ teintes, zones, depart, cleReset = "", onChange }: AireLibreProps) {
  const [positions, setPositions] = useState<string[]>(depart);
  const [glisse, setGlisse] = useState<{ id: number; x: number; y: number } | null>(null);

  const zoneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  useEffect(() => {
    setPositions(depart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleReset, teintes.length, zones.length]);

  const comptes = useMemo(() => {
    const total: Record<string, number> = {};
    for (const z of zones) total[z.cle] = 0;
    for (const p of positions) total[p] = (total[p] ?? 0) + 1;
    return total;
  }, [positions, zones]);

  useEffect(() => {
    onChange?.(comptes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(comptes)]);

  const deposer = useCallback(
    (id: number, x: number, y: number) => {
      let cible = positionsRef.current[id] ?? zones[0]?.cle ?? "";
      zones.forEach((z, i) => {
        const rect = zoneRefs.current[i]?.getBoundingClientRect();
        if (rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          cible = z.cle;
        }
      });
      setPositions((anciennes) => {
        const copie = [...anciennes];
        copie[id] = cible;
        return copie;
      });
    },
    [zones],
  );

  useEffect(() => {
    if (!glisse) return;
    const bouger = (e: PointerEvent) =>
      setGlisse((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
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

  const Jeton = ({ id }: { id: number }) => (
    <button
      type="button"
      aria-label={`jeton ${id + 1}`}
      onPointerDown={(e) => {
        e.preventDefault();
        setGlisse({ id, x: e.clientX, y: e.clientY });
      }}
      className="size-9 touch-none select-none rounded-full border-2 border-white shadow-sm transition-transform active:scale-95 sm:size-10"
      style={{ background: teintes[id], opacity: glisse?.id === id ? 0.3 : 1 }}
    />
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {zones.map((z, i) => (
        <div
          key={z.cle}
          ref={(el) => {
            zoneRefs.current[i] = el;
          }}
          className="flex min-h-44 flex-col justify-between gap-3 rounded-3xl border-2 border-dashed border-ink/20 bg-white/60 p-4"
        >
          <p className="text-center text-base font-bold text-inksoft">{z.titre}</p>
          <div className="flex flex-1 flex-wrap content-start justify-center gap-2">
            {positions.map((p, id) => (p === z.cle ? <Jeton key={id} id={id} /> : null))}
          </div>
          <p className="text-center">
            <span className="rounded-full bg-secondary px-4 py-1 text-lg font-extrabold text-ink">
              {comptes[z.cle] ?? 0}
            </span>
          </p>
        </div>
      ))}

      {glisse && (
        <div
          className="pointer-events-none fixed z-50 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
          style={{ left: glisse.x, top: glisse.y, background: teintes[glisse.id] }}
        />
      )}
    </div>
  );
}
