import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  JAssocie,
  JeComplete,
  JeConstruis,
  JeRepere,
  JeTrouveLePronom,
} from "@/components/verbes/Activites";
import { Carte, Consigne, Page } from "@/components/multi/Ui";
import { useReglages } from "@/lib/multi/reglages";
import { TEMPS, VERBES, auHasard, formes, type TempsId, type Verbe } from "@/lib/verbes/donnees";
import { useReglagesVerbes, type ActiviteVerbe } from "@/lib/verbes/reglages";

export const Route = createFileRoute("/verbes")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Je pratique les verbes — J'apprends ici" },
      {
        name: "description",
        content:
          "Comprendre le radical et la terminaison, associer pronoms et formes, compléter des phrases : la conjugaison pas à pas.",
      },
      { property: "og:title", content: "Je pratique les verbes — J'apprends ici" },
      {
        property: "og:description",
        content: "Des activités douces pour construire et conjuguer les verbes, sans chronomètre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Verbes,
});

const QUESTIONS_PAR_SERIE = 20;

const ACTIVITES: Array<{ cle: ActiviteVerbe; emoji: string; titre: string; sous: string; consigne: string }> = [
  { cle: "construis", emoji: "🧱", titre: "je construis", sous: "radical + terminaison", consigne: "Choisis la bonne terminaison." },
  { cle: "associe", emoji: "🔗", titre: "j'associe", sous: "chaque pronom avec sa forme", consigne: "Associe chaque pronom à la bonne forme." },
  { cle: "complete", emoji: "✍️", titre: "je complète", sous: "le verbe qui manque", consigne: "Complète la phrase." },
  { cle: "pronom", emoji: "👥", titre: "je trouve le pronom", sous: "qui fait l'action ?", consigne: "Trouve le pronom." },
  { cle: "repere", emoji: "🔍", titre: "je repère", sous: "le verbe utilisé", consigne: "Touche le verbe." },
  { cle: "pratique", emoji: "🌈", titre: "je pratique", sous: "un peu de tout", consigne: "Réponds à ton rythme." },
];

function GrosBouton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-white bg-white/70 p-5 text-left text-2xl font-extrabold transition-transform active:scale-[0.99]"
    >
      {children}
    </button>
  );
}

function Verbes() {
  const [reglages] = useReglagesVerbes();
  const [{ audio }] = useReglages();
  const [verbe, setVerbe] = useState<Verbe | null>(null);
  const [temps, setTemps] = useState<TempsId | null>(null);
  const [activite, setActivite] = useState<ActiviteVerbe | null>(null);
  const [numero, setNumero] = useState(0);
  const [reussi, setReussi] = useState(false);

  const verbesPermis = VERBES.filter((v) => reglages.verbes.includes(v.infinitif));
  const tempsPermis = TEMPS.filter((t) => t.actif && reglages.temps.includes(t.id));
  const activitesPermises = ACTIVITES.filter((a) => reglages.activites[a.cle]);

  const retour = (
    <button
      type="button"
      onClick={() => {
        if (activite) setActivite(null);
        else if (temps) setTemps(null);
        else setVerbe(null);
        setReussi(false);
      }}
      className="mb-4 rounded-full border border-white bg-white/70 px-4 py-2 text-base font-bold text-ink"
    >
      ← retour
    </button>
  );

  const suivant = () => {
    setNumero((n) => n + 1);
    setReussi(false);
  };

  // Étape 1 : le verbe
  if (!verbe) {
    return (
      <Page titre="✏️ je pratique les verbes">
        <Carte>
          <Consigne texte="Quel verbe veux-tu pratiquer ?" audio={audio} />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {verbesPermis.map((v) => (
              <GrosBouton key={v.infinitif} onClick={() => setVerbe(v)}>
                <span className="block text-center">{v.infinitif}</span>
              </GrosBouton>
            ))}
          </div>
        </Carte>
      </Page>
    );
  }

  // Étape 2 : le temps
  if (!temps) {
    return (
      <Page titre="✏️ je pratique les verbes">
        {retour}
        <Carte>
          <Consigne texte="Quel temps veux-tu pratiquer ?" audio={audio} />
          <div className="mt-8 grid gap-3">
            {tempsPermis
              .filter((t) => formes(verbe, t.id))
              .map((t) => (
                <GrosBouton key={t.id} onClick={() => setTemps(t.id)}>
                  {t.nom}
                </GrosBouton>
              ))}
          </div>
        </Carte>
      </Page>
    );
  }

  // Étape 3 : l'activité
  if (!activite) {
    return (
      <Page titre={`✏️ ${verbe.infinitif}`}>
        {retour}
        <Carte>
          <Consigne texte="Que veux-tu faire ?" audio={audio} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {activitesPermises.map((a) => (
              <GrosBouton
                key={a.cle}
                onClick={() => {
                  setActivite(a.cle);
                  setNumero(0);
                  setReussi(false);
                }}
              >
                <span className="flex items-center gap-4">
                  <span className="text-3xl">{a.emoji}</span>
                  <span>
                    <span className="block">{a.titre}</span>
                    <span className="block text-base font-bold text-inksoft">{a.sous}</span>
                  </span>
                </span>
              </GrosBouton>
            ))}
          </div>
        </Carte>
      </Page>
    );
  }

  // Mode « je pratique » : mélange des activités et des verbes permis.
  let actuelle: ActiviteVerbe = activite;
  let verbeActuel = verbe;
  if (activite === "pratique") {
    const melange = activitesPermises.filter((a) => a.cle !== "pratique").map((a) => a.cle);
    const graine = numero;
    actuelle = melange.length ? (melange[graine % melange.length] as ActiviteVerbe) : "construis";
    const avecTemps = verbesPermis.filter((v) => formes(v, temps));
    verbeActuel = graine === 0 ? verbe : avecTemps.length ? auHasard(avecTemps) : verbe;
  }
  const infos = ACTIVITES.find((a) => a.cle === actuelle)!;
  const k = `${actuelle}-${verbeActuel.infinitif}-${numero}`;
  const props = {
    verbe: verbeActuel,
    temps,
    niveau: reglages.niveau,
    onReussi: () => setReussi(true),
  };

  const serieFinie = numero + 1 >= QUESTIONS_PAR_SERIE;

  return (
    <Page titre={`${infos.emoji} ${infos.titre}`}>
      {retour}
      <Carte>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span
            role="status"
            className="rounded-full border border-white bg-white/80 px-4 py-2 text-base font-extrabold text-ink"
          >
            question {numero + 1} / {QUESTIONS_PAR_SERIE}
          </span>
          {!serieFinie && (
            <span className="text-base font-bold text-inksoft">
              encore {QUESTIONS_PAR_SERIE - numero - 1} question
              {QUESTIONS_PAR_SERIE - numero - 1 > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Consigne texte={infos.consigne} audio={audio} />
        <div className="mt-8">
          {actuelle === "construis" && <JeConstruis key={k} {...props} />}
          {actuelle === "associe" && <JAssocie key={k} {...props} />}
          {actuelle === "complete" && <JeComplete key={k} {...props} />}
          {actuelle === "pronom" && <JeTrouveLePronom key={k} onReussi={props.onReussi} />}
          {actuelle === "repere" && <JeRepere key={k} {...props} />}
        </div>
        {reussi && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {serieFinie ? (
              <>
                <p className="w-full text-center text-2xl font-extrabold">
                  Bravo ! Tu as fait les {QUESTIONS_PAR_SERIE} questions 🌟
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNumero(0);
                    setReussi(false);
                  }}
                  className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white"
                >
                  recommencer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivite(null);
                    setNumero(0);
                    setReussi(false);
                  }}
                  className="rounded-2xl border border-white bg-white/80 px-6 py-4 text-lg font-extrabold"
                >
                  choisir une autre activité
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={suivant}
                className="rounded-2xl bg-ink px-6 py-4 text-lg font-extrabold text-white"
              >
                question suivante →
              </button>
            )}
          </div>
        )}
      </Carte>
    </Page>
  );
}
