import type { MotAnalyse } from "@/lib/phonetique/segmenter";

type Taille = "sm" | "md" | "lg";

const TAILLES: Record<Taille, string> = {
  sm: "text-base sm:text-lg px-2.5 py-1.5 rounded-xl",
  md: "text-2xl sm:text-3xl px-3.5 py-2.5 rounded-2xl",
  lg: "text-4xl sm:text-5xl px-5 py-4 rounded-3xl",
};

const ESPACES: Record<Taille, string> = {
  sm: "gap-1.5",
  md: "gap-2.5",
  lg: "gap-3",
};

interface Props {
  analyse: MotAnalyse;
  taille?: Taille;
  /** Afficher les couleurs des sons (sinon : blocs neutres). */
  couleurs?: boolean;
  /** Afficher le nom du son sous chaque bloc. */
  etiquettes?: boolean;
  className?: string;
}

export function BlocsSons({
  analyse,
  taille = "md",
  couleurs = true,
  etiquettes = false,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-wrap items-start ${ESPACES[taille]} ${className}`}>
      {analyse.graphemes.map((g, i) => {
        const muet = g.phoneme.type === "muet";
        return (
          <div key={`${g.graphie}-${i}`} className="flex flex-col items-center gap-1">
            <span
              className={`font-display font-extrabold leading-none text-ink ${TAILLES[taille]} ${
                muet
                  ? "border-2 border-dashed border-inksoft/40 opacity-70"
                  : "border border-white/70"
              }`}
              style={{
                backgroundColor: couleurs ? g.couleur : "var(--son-muet)",
              }}
            >
              {g.graphie}
            </span>
            {etiquettes && (
              <span className="text-[11px] font-bold text-inksoft">
                {muet ? "muet" : g.phoneme.son}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
