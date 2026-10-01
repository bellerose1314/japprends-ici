import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Connexion — J'apprends ici" },
      {
        name: "description",
        content: "Connecte-toi pour sauvegarder les mots de vocabulaire de chaque enfant.",
      },
      { property: "og:title", content: "Connexion — J'apprends ici" },
      {
        property: "og:description",
        content: "Un compte pour garder les mots de chaque enfant, sur tous les appareils.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Connexion,
});

function destinationAutorisee(): string {
  const param = new URLSearchParams(window.location.search).get("next");
  if (param && param.startsWith("/") && !param.startsWith("//")) return param;
  return "/";
}

function Connexion() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"connexion" | "creation">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnCours(true);
    try {
      if (mode === "connexion") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
        if (error) {
          setErreur(
            error.message === "Invalid login credentials"
              ? "Courriel ou mot de passe incorrect."
              : "Connexion impossible pour le moment. Réessaie.",
          );
          return;
        }
        navigate({ to: destinationAutorisee() });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          if (error.message.includes("weak_password") || error.message.includes("pwned")) {
            setErreur("Ce mot de passe est trop facile à deviner. Choisis-en un plus long ou différent.");
          } else if (error.message.includes("already registered")) {
            setErreur("Ce compte existe déjà — connecte-toi.");
          } else {
            setErreur("Création du compte impossible. Vérifie le courriel et le mot de passe (6 caractères minimum).");
          }
          return;
        }
        if (data.session) {
          navigate({ to: destinationAutorisee() });
        } else {
          setMessage("C'est presque fait ! Ouvre ta boîte mail et clique sur le lien pour activer ton compte.");
        }
      }
    } finally {
      setEnCours(false);
    }
  };

  const connexionGoogle = async () => {
    setErreur(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setErreur("Connexion Google impossible pour le moment.");
    if (result.redirected) return;
  };

  return (
    <div className="min-h-screen w-full bg-background font-sans text-ink">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <Link to="/mots" className="flex items-center gap-3 self-center">
          <span className="glow grid size-12 place-items-center rounded-2xl border border-white bg-white/70 text-2xl">
            🔤
          </span>
          <span className="font-display text-xl font-extrabold">Mes mots</span>
        </Link>

        <div className="glass glow rounded-3xl border border-white p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-mist p-1.5">
            {(
              [
                ["connexion", "Se connecter"],
                ["creation", "Créer un compte"],
              ] as const
            ).map(([valeur, libelle]) => (
              <button
                key={valeur}
                type="button"
                onClick={() => {
                  setMode(valeur);
                  setErreur(null);
                  setMessage(null);
                }}
                className={`font-display rounded-xl px-4 py-2.5 font-bold transition ${
                  mode === valeur ? "bg-white text-ink shadow-sm" : "text-inksoft hover:text-ink"
                }`}
              >
                {libelle}
              </button>
            ))}
          </div>

          <form onSubmit={soumettre} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-inksoft">Courriel</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@exemple.com"
                autoComplete="email"
                className="rounded-2xl border border-white bg-white/80 px-4 py-3 font-semibold text-ink placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-inksoft">Mot de passe</span>
              <input
                type="password"
                required
                minLength={6}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="6 caractères ou plus"
                autoComplete={mode === "connexion" ? "current-password" : "new-password"}
                className="rounded-2xl border border-white bg-white/80 px-4 py-3 font-semibold text-ink placeholder:text-inksoft/60 focus:ring-4 focus:ring-ring/60 focus:outline-none"
              />
            </label>

            {erreur && (
              <p role="alert" className="rounded-2xl bg-ink/5 px-4 py-3 text-sm font-semibold text-ink">
                {erreur}
              </p>
            )}
            {message && (
              <p role="status" className="rounded-2xl bg-success/15 px-4 py-3 text-sm font-semibold text-ink">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={enCours}
              className="font-display rounded-2xl bg-ink px-6 py-3.5 text-lg font-extrabold text-white transition hover:bg-ink/90 disabled:opacity-60"
            >
              {enCours
                ? "Un instant…"
                : mode === "connexion"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-bold tracking-wide text-inksoft uppercase">
            <span className="h-px flex-1 bg-ink/10" /> ou <span className="h-px flex-1 bg-ink/10" />
          </div>

          <button
            type="button"
            onClick={connexionGoogle}
            className="font-display flex w-full items-center justify-center gap-3 rounded-2xl border border-white bg-white/80 px-6 py-3.5 text-lg font-extrabold text-ink transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.62.75 3.84 3.27 2.06 6.86l3.66 2.84C6.6 7.02 9.05 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.25 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.15-1.99 3.5-4.92 3.5-8.67z"
              />
              <path
                fill="#FBBC05"
                d="M5.73 14.3a7.2 7.2 0 0 1 0-4.6L2.06 6.86a11.26 11.26 0 0 0 0 10.28l3.67-2.84z"
              />
              <path
                fill="#34A853"
                d="M12 23.25c3.04 0 5.6-1 7.46-2.72l-3.68-2.85c-1.02.69-2.33 1.1-3.78 1.1-2.95 0-5.4-1.98-6.28-4.66l-3.66 2.84c1.78 3.59 5.56 6.29 9.94 6.29z"
              />
            </svg>
            Continuer avec Google
          </button>
        </div>

        <p className="text-center text-sm font-medium text-inksoft">
          Un compte garde les mots de chaque enfant, sur l'ordinateur comme sur la tablette.
        </p>
      </div>
    </div>
  );
}
