import { Link } from "@tanstack/react-router";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

/** Zone de compte dans l'en-tête : connexion, ou courriel + déconnexion. */
export function CompteMenu() {
  const { user, chargement } = useSession();

  if (chargement) {
    return <span className="text-sm font-semibold text-inksoft">…</span>;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        className="font-display inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-2.5 font-bold text-white transition hover:bg-ink/90"
      >
        Se connecter
      </Link>
    );
  }

  return (
    <div className="glass flex items-center gap-3 rounded-full border border-white px-4 py-2">
      <span className="max-w-40 truncate text-sm font-semibold text-inksoft">{user.email}</span>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="text-sm font-bold text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
      >
        Déconnexion
      </button>
    </div>
  );
}
