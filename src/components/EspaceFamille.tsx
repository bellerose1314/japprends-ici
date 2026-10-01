import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";

import { BlocsSons } from "@/components/BlocsSons";
import {
  ajouterEnfant,
  ajouterListe,
  ajouterMot,
  listerEnfants,
  listerListes,
  supprimerListe,
  listerMots,
  supprimerEnfant,
  supprimerMot,
} from "@/lib/mesmots.functions";
import { analyserMot } from "@/lib/phonetique/segmenter";

type Props = {
  enfantId: string | null;
  choisirEnfant: (id: string) => void;
  onChoisirMot: (mot: string) => void;
  motActif: string;
};

/** Espace du parent : les enfants et leurs listes de mots, sauvegardés dans le cloud. */
export function EspaceFamille({ enfantId, choisirEnfant, onChoisirMot, motActif }: Props) {
  const queryClient = useQueryClient();

  const fetchEnfants = useServerFn(listerEnfants);
  const enfantsQ = useQuery({ queryKey: ["enfants"], queryFn: () => fetchEnfants() });
  const enfants = enfantsQ.data ?? [];

  useEffect(() => {
    const premier = enfants[0];
    if (!enfantId && premier) choisirEnfant(premier.id);
  }, [enfantId, enfants, choisirEnfant]);

  const enfant = enfants.find((e) => e.id === enfantId) ?? null;

  return (
    <>
      {/* Les enfants du compte */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-bold tracking-wide text-inksoft uppercase">
          Pour quel enfant ?
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {enfants.map((e) => (
            <span
              key={e.id}
              className={`font-display inline-flex items-center gap-2 rounded-full border px-4 py-2 font-bold transition ${
                e.id === enfantId
                  ? "border-ink/20 bg-ink text-white"
                  : "border-white bg-white/70 text-ink hover:bg-white"
              }`}
            >
              <button type="button" onClick={() => choisirEnfant(e.id)}>
                {e.prenom}
              </button>
              <SupprimerEnfantBtn
                id={e.id}
                prenom={e.prenom}
                onDone={() => {
                  queryClient.invalidateQueries({ queryKey: ["enfants"] });
                  if (e.id === enfantId) choisirEnfant("");
                }}
              />
            </span>
          ))}
          <NouvelEnfant onCree={() => queryClient.invalidateQueries({ queryKey: ["enfants"] })} />
        </div>
        {enfantsQ.isLoading && <p className="text-sm font-medium text-inksoft">Chargement…</p>}
      </div>

      {/* Les mots de l'enfant choisi */}
      {enfant ? (
        <ListeMots enfantId={enfant.id} prenom={enfant.prenom} onChoisirMot={onChoisirMot} motActif={motActif} />
      ) : (
        enfants.length === 0 &&
        !enfantsQ.isLoading && (
          <p className="font-medium text-inksoft">
            Ajoute le prénom d'un enfant ci-dessus pour commencer sa liste de mots.
          </p>
        )
      )}
    </>
  );
}

function SupprimerEnfantBtn({ id, prenom, onDone }: { id: string; prenom: string; onDone: () => void }) {
  const fn = useServerFn(supprimerEnfant);
  const [confirme, setConfirme] = useState(false);

  if (!confirme) {
    return (
      <button
        type="button"
        aria-label={`Retirer ${prenom}`}
        onClick={() => setConfirme(true)}
        className="opacity-40 transition hover:opacity-80"
      >
        ×
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={async () => {
          await fn({ data: { id } });
          onDone();
        }}
        className="underline"
      >
        confirmer
      </button>
      <button type="button" onClick={() => setConfirme(false)} className="opacity-60">
        annuler
      </button>
    </span>
  );
}

function NouvelEnfant({ onCree }: { onCree: () => void }) {
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
        className="font-display rounded-full border border-dashed border-ink/25 px-4 py-2 font-bold text-inksoft transition hover:border-ink/50 hover:text-ink"
      >
        + Ajouter un enfant
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
        className="w-32 rounded-full border border-white bg-white/80 px-4 py-2 font-bold text-ink placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={enCours}
        className="font-display rounded-full bg-ink px-4 py-2 font-bold text-white disabled:opacity-60"
      >
        {enCours ? "…" : "OK"}
      </button>
      <button type="button" onClick={() => setOuvert(false)} className="font-semibold text-inksoft">
        annuler
      </button>
    </form>
  );
}

function ListeMots({
  enfantId,
  prenom,
  onChoisirMot,
  motActif,
}: {
  enfantId: string;
  prenom: string;
  onChoisirMot: (mot: string) => void;
  motActif: string;
}) {
  const queryClient = useQueryClient();
  const fetchMots = useServerFn(listerMots);
  const motsQ = useQuery({
    queryKey: ["mots", enfantId],
    queryFn: () => fetchMots({ data: { enfantId } }),
  });
  const fetchListes = useServerFn(listerListes);
  const listesQ = useQuery({
    queryKey: ["listes", enfantId],
    queryFn: () => fetchListes({ data: { enfantId } }),
  });
  const listes = listesQ.data ?? [];
  const [listeId, setListeId] = useState<string | null>(null);
  useEffect(() => setListeId(null), [enfantId]);
  const listeActive = listes.find((l) => l.id === listeId) ?? null;
  const tous = motsQ.data ?? [];
  const mots = listeActive ? tous.filter((m) => m.liste_id === listeActive.id) : tous;

  return (
    <div>
      <ListesChips
        enfantId={enfantId}
        listes={listes}
        listeId={listeActive?.id ?? null}
        choisir={setListeId}
        total={tous.length}
        compte={(id) => tous.filter((m) => m.liste_id === id).length}
        onChange={() => {
          queryClient.invalidateQueries({ queryKey: ["listes", enfantId] });
          queryClient.invalidateQueries({ queryKey: ["mots", enfantId] });
        }}
      />
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-lg font-extrabold">
          {listeActive ? listeActive.nom : `Les mots de ${prenom}`}{" "}
          <span className="text-sm font-semibold text-inksoft">({mots.length})</span>
        </p>
        <AjouterMot
          enfantId={enfantId}
          listeId={listeActive?.id ?? null}
          onAjoute={() => queryClient.invalidateQueries({ queryKey: ["mots", enfantId] })}
        />
      </div>

      {motsQ.isLoading ? (
        <p className="font-medium text-inksoft">Chargement des mots…</p>
      ) : mots.length === 0 ? (
        <p className="font-medium text-inksoft">
          {listeActive
            ? "Cette liste est vide. Ajoute ses mots avec « + Mot »."
            : "Aucun mot encore. Découvre un mot en haut, puis « Ajouter ce mot »."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {mots.map((m) => {
            const a = analyserMot(m.mot);
            return (
              <div
                key={m.id}
                className={`relative rounded-2xl border bg-white/70 p-4 transition hover:bg-white ${
                  m.mot === motActif ? "border-ink/20 ring-2 ring-ink/10" : "border-white"
                }`}
              >
                <button type="button" onClick={() => onChoisirMot(m.mot)} className="block w-full text-left">
                  <p className="font-display mb-2 pr-5 text-lg font-extrabold lowercase">{m.mot}</p>
                  <BlocsSons analyse={a} taille="sm" />
                </button>
                <SupprimerMot id={m.id} onDone={() => queryClient.invalidateQueries({ queryKey: ["mots", enfantId] })} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SupprimerMot({ id, onDone }: { id: string; onDone: () => void }) {
  const fn = useServerFn(supprimerMot);
  const [confirme, setConfirme] = useState(false);

  if (!confirme) {
    return (
      <button
        type="button"
        aria-label="Retirer ce mot"
        onClick={() => setConfirme(true)}
        className="absolute top-2 right-2 text-lg leading-none text-inksoft opacity-40 transition hover:opacity-80"
      >
        ×
      </button>
    );
  }
  return (
    <span className="absolute top-2 right-2 flex items-center gap-1.5 text-xs font-bold">
      <button
        type="button"
        onClick={async () => {
          await fn({ data: { id } });
          onDone();
        }}
        className="text-ink underline"
      >
        confirmer
      </button>
      <button type="button" onClick={() => setConfirme(false)} className="text-inksoft">
        non
      </button>
    </span>
  );
}

function ListesChips({
  enfantId,
  listes,
  listeId,
  choisir,
  total,
  compte,
  onChange,
}: {
  enfantId: string;
  listes: { id: string; nom: string }[];
  listeId: string | null;
  choisir: (id: string | null) => void;
  total: number;
  compte: (id: string) => number;
  onChange: () => void;
}) {
  const ajouter = useServerFn(ajouterListe);
  const supprimer = useServerFn(supprimerListe);
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const chip = (actif: boolean) =>
    `font-display rounded-full px-4 py-2 font-extrabold transition ${
      actif ? "bg-ink text-card" : "bg-white/80 text-ink hover:bg-white"
    }`;

  const creer = async (e: FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    const l = await ajouter({ data: { enfantId, nom } });
    setNom("");
    setOuvert(false);
    onChange();
    choisir(l.id);
  };

  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-bold text-inksoft">Mes listes</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => choisir(null)} className={chip(listeId === null)}>
          tous les mots ({total})
        </button>
        {listes.map((l) => (
          <span key={l.id} className="flex items-center gap-1">
            <button type="button" onClick={() => choisir(l.id)} className={chip(listeId === l.id)}>
              {l.nom} ({compte(l.id)})
            </button>
            {listeId === l.id &&
              (aSupprimer === l.id ? (
                <span className="flex gap-1.5 text-xs font-bold">
                  <button
                    type="button"
                    className="text-ink underline"
                    onClick={async () => {
                      await supprimer({ data: { id: l.id } });
                      setASupprimer(null);
                      choisir(null);
                      onChange();
                    }}
                  >
                    supprimer la liste
                  </button>
                  <button type="button" className="text-inksoft" onClick={() => setASupprimer(null)}>
                    non
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  aria-label="Supprimer cette liste"
                  onClick={() => setASupprimer(l.id)}
                  className="px-1 text-lg text-inksoft opacity-50 hover:opacity-90"
                >
                  ×
                </button>
              ))}
          </span>
        ))}
        {ouvert ? (
          <form onSubmit={creer} className="flex items-center gap-2">
            <input
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex. semaine 1"
              maxLength={40}
              className="w-40 rounded-full border border-white bg-white/80 px-4 py-2 font-bold text-ink focus:ring-4 focus:ring-ring/60 focus:outline-none"
            />
            <button type="submit" className="font-display rounded-full bg-secondary px-4 py-2 font-extrabold text-ink">
              OK
            </button>
            <button type="button" onClick={() => setOuvert(false)} className="font-semibold text-inksoft">
              annuler
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="rounded-full border-2 border-dashed border-ink/20 px-4 py-2 font-bold text-inksoft hover:bg-white/60"
          >
            + nouvelle liste
          </button>
        )}
      </div>
      {listes.length > 0 && (
        <p className="mt-2 text-xs font-semibold text-inksoft">
          Si on supprime une liste, ses mots restent dans « tous les mots ».
        </p>
      )}
    </div>
  );
}

function AjouterMot({
  enfantId,
  listeId,
  onAjoute,
}: {
  enfantId: string;
  listeId: string | null;
  onAjoute: () => void;
}) {
  const fn = useServerFn(ajouterMot);
  const [mot, setMot] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async (valeur: string) => {
      const res = await fn({ data: { enfantId, mot: valeur, listeId } });
      return res;
    },
    onSuccess: (res) => {
      setNote(res.deja ? "Déjà dans la liste" : res.deplace ? "Rangé dans cette liste ✓" : "Ajouté ✓");
      setMot("");
      onAjoute();
      setTimeout(() => setNote(null), 2500);
    },
  });

  const soumettre = (e: FormEvent) => {
    e.preventDefault();
    if (mot.trim()) mutation.mutate(mot);
  };

  return (
    <form onSubmit={soumettre} className="flex items-center gap-2">
      <input
        value={mot}
        onChange={(e) => setMot(e.target.value)}
        placeholder="Ajouter un mot…"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={40}
        className="w-40 rounded-full border border-white bg-white/80 px-4 py-2 font-bold text-ink lowercase placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="font-display rounded-full bg-secondary px-4 py-2 font-extrabold text-ink transition hover:brightness-95 disabled:opacity-60"
      >
        + Mot
      </button>
      {note && <span className="text-sm font-bold text-inksoft">{note}</span>}
    </form>
  );
}
