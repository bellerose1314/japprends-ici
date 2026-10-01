import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Zone de manipulation avec une réserve infinie : deux jetons de couleur
 * qui se dupliquent. L'enfant glisse un jeton de la réserve vers une boîte
 * (il en crée un nouveau). Glisser un jeton hors des boîtes le retire.
 * Fonctionne à la souris et au doigt (événements « pointer »).
 */

export type ZoneInfinie = { cle: string; titre: string };
export type SourceJeton = { teinte: string; nom: string };

/** comptes[zone][teinte] = nombre de jetons */
export type ComptesInfinis = Record<string, Record<string, number>>;

export const SOURCES_DEFAUT: SourceJeton[] = [
  { teinte: "var(--son-a)", nom: "orange" },
  { teinte: "var(--son-u)", nom: "bleu" },
];

type Jeton = { id: number; teinte: string; zone: string; barre?: boolean };
type Glisse = { x: number; y: number; x0: number; y0: number; teinte: string; id: number | null };

export type AireInfinieProps = {
  zones: ZoneInfinie[];
  sources?: SourceJeton[];
  cleReset?: string;
  onChange?: (comptes: ComptesInfinis) => void;
  /** Disposition des boîtes : « grille » (2 colonnes) ou « groupes » (petites boîtes). */
  disposition?: "grille" | "groupes";
  /** Signe affiché entre les boîtes (ex. « + »). */
  separateur?: string;
  /** Toucher un jeton (sans le glisser) le barre d'un X. Compté dans comptes[zone]["x"]. */
  barrable?: boolean;
};

export function totalZone(comptes: ComptesInfinis, zone: string): number {
  return Object.entries(comptes[zone] ?? {}).reduce((s, [k, n]) => (k === "x" ? s : s + n), 0);
}

export function AireInfinie({
  zones,
  sources = SOURCES_DEFAUT,
  cleReset = "",
  onChange,
  disposition = "grille",
  separateur,
  barrable = false,
}: AireInfinieProps) {
  const [jetons, setJetons] = useState<Jeton[]>([]);
  const [glisse, setGlisse] = useState<Glisse | null>(null);
  const prochainId = useRef(1);
  const zoneRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    setJetons([]);
  }, [cleReset, zones.length]);

  const comptes = useMemo(() => {
    const total: ComptesInfinis = {};
    for (const z of zones) {
      total[z.cle] = {};
      for (const s of sources) total[z.cle]![s.teinte] = 0;
      if (barrable) total[z.cle]!["x"] = 0;
    }
    for (const j of jetons) {
      const z = (total[j.zone] ??= {});
      z[j.teinte] = (z[j.teinte] ?? 0) + 1;
      if (j.barre) z["x"] = (z["x"] ?? 0) + 1;
    }
    return total;
  }, [jetons, zones, sources]);

  useEffect(() => {
    onChange?.(comptes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(comptes)]);

  const deposer = useCallback(
    (g: Glisse, x: number, y: number) => {
      if (barrable && g.id !== null && Math.hypot(x - g.x0, y - g.y0) < 8) {
        setJetons((a) => a.map((j) => (j.id === g.id ? { ...j, barre: !j.barre } : j)));
        return;
      }
      let cible: string | null = null;
      zones.forEach((z, i) => {
        const r = zoneRefs.current[i]?.getBoundingClientRect();
        if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) cible = z.cle;
      });
      setJetons((anciens) => {
        if (g.id === null) {
          if (!cible) return anciens;
          return [...anciens, { id: prochainId.current++, teinte: g.teinte, zone: cible }];
        }
        if (!cible) return anciens.filter((j) => j.id !== g.id);
        return anciens.map((j) => (j.id === g.id ? { ...j, zone: cible as string } : j));
      });
    },
    [zones, barrable],
  );

  useEffect(() => {
    if (!glisse) return;
    const bouger = (e: PointerEvent) =>
      setGlisse((g) => (g ? { ...g, x: e.clientX, y: e.clientY } : g));
    const lacher = (e: PointerEvent) => {
      deposer(glisse, e.clientX, e.clientY);
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

  const groupes = disposition === "groupes";

  return (
    <div className="flex flex-col gap-6">
      <div
        className={
          groupes
            ? "flex flex-wrap justify-center gap-4"
            : separateur
              ? "flex items-stretch gap-3"
              : zones.length === 1 ? "grid" : "grid gap-4 sm:grid-cols-2"
        }
      >
        {zones.map((z, i) => (
          <Fragment key={z.cle}>
          {separateur && i > 0 && (
            <span className="self-center text-5xl font-extrabold text-ink">{separateur}</span>
          )}
          <div
            ref={(el) => {
              zoneRefs.current[i] = el;
            }}
            className={`flex flex-col justify-between gap-3 rounded-3xl border-2 border-dashed border-ink/20 bg-white/60 p-3 ${
              groupes ? "min-h-36 w-32 items-center sm:w-36" : `min-h-44 p-4 ${separateur ? "flex-1" : ""}`
            }`}
          >
            {z.titre && <p className="text-center text-base font-bold text-inksoft">{z.titre}</p>}
            <div className="flex flex-1 flex-wrap content-start justify-center gap-2">
              {jetons
                .filter((j) => j.zone === z.cle)
                .map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    aria-label={j.barre ? "jeton barré" : "jeton"}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setGlisse({ id: j.id, teinte: j.teinte, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
                    }}
                    className="relative flex size-9 touch-none select-none items-center justify-center rounded-full border-2 border-white shadow-sm active:scale-95 sm:size-10"
                    style={{ background: j.teinte, opacity: glisse?.id === j.id ? 0.3 : 1 }}
                  >
                    {j.barre && (
                      <span className="text-3xl font-black leading-none text-ink">✕</span>
                    )}
                  </button>
                ))}
            </div>
            <p className="text-center">
              <span className="rounded-full bg-secondary px-4 py-1 text-lg font-extrabold text-ink">
                {totalZone(comptes, z.cle)}
              </span>
            </p>
          </div>
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-secondary/60 p-4">
        <div className="flex justify-center gap-8">
          {sources.map((s) => (
            <div key={s.teinte} className="flex flex-col items-center gap-1">
              <button
                type="button"
                aria-label={`prendre un jeton ${s.nom}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setGlisse({ id: null, teinte: s.teinte, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
                }}
                className="size-14 touch-none select-none rounded-full border-4 border-white shadow-md active:scale-95"
                style={{ background: s.teinte }}
              />
              <span className="text-sm font-bold text-inksoft">{s.nom}</span>
            </div>
          ))}
        </div>
        <span className="text-center text-sm text-inksoft">
          {barrable
            ? "glisse des ronds dans la boîte · touche un rond pour le barrer d'un X"
            : "glisse un jeton dans une boîte · ramène-le ici pour l'enlever"}
        </span>
      </div>

      {glisse && (
        <div
          className="pointer-events-none fixed z-50 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
          style={{ left: glisse.x, top: glisse.y, background: glisse.teinte }}
        />
      )}
    </div>
  );
}
