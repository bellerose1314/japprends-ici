import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { nettoyerMot } from "@/lib/phonetique/segmenter";

export type Enfant = { id: string; prenom: string };
export type MotSauve = { id: string; mot: string; liste_id: string | null };
export type Liste = { id: string; nom: string };

export const listerEnfants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("enfants")
      .select("id, prenom")
      .eq("parent_id", context.userId)
      .order("created_at");
    if (error) throw error;
    return data as Enfant[];
  });

export const ajouterEnfant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ prenom: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data, context }) => {
    const prenom = data.prenom.trim().replace(/\s+/g, " ");
    const { data: enfant, error } = await context.supabase
      .from("enfants")
      .insert({ parent_id: context.userId, prenom })
      .select("id, prenom")
      .single();
    if (error) throw error;
    return enfant as Enfant;
  });

export const supprimerEnfant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("enfants")
      .delete()
      .eq("id", data.id)
      .eq("parent_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const listerMots = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ enfantId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: mots, error } = await context.supabase
      .from("mots")
      .select("id, mot, liste_id")
      .eq("parent_id", context.userId)
      .eq("enfant_id", data.enfantId)
      .order("created_at");
    if (error) throw error;
    return mots as MotSauve[];
  });

export const ajouterMot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({ enfantId: z.string().uuid(), mot: z.string().min(1).max(40), listeId: z.string().uuid().nullish() })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const mot = nettoyerMot(data.mot);
    if (!mot) throw new Error("Mot invalide");

    // L'enfant doit appartenir au compte connecté (RLS + vérification explicite).
    const { data: enfant } = await context.supabase
      .from("enfants")
      .select("id")
      .eq("id", data.enfantId)
      .eq("parent_id", context.userId)
      .single();
    if (!enfant) throw new Error("Enfant introuvable");

    const { data: motCree, error } = await context.supabase
      .from("mots")
      .insert({ parent_id: context.userId, enfant_id: data.enfantId, mot, liste_id: data.listeId ?? null })
      .select("id, mot, liste_id")
      .single();

    if (error) {
      if (error.code === "23505") {
        // Le mot existe déjà : on le range dans la liste choisie.
        if (data.listeId) {
          await context.supabase
            .from("mots")
            .update({ liste_id: data.listeId })
            .eq("enfant_id", data.enfantId)
            .eq("parent_id", context.userId)
            .eq("mot", mot);
          return { deja: false, deplace: true, mot: null as MotSauve | null };
        }
        return { deja: true, deplace: false, mot: null as MotSauve | null };
      }
      throw error;
    }
    return { deja: false, deplace: false, mot: motCree as MotSauve | null };
  });

export const supprimerMot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("mots")
      .delete()
      .eq("id", data.id)
      .eq("parent_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const listerListes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ enfantId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: listes, error } = await context.supabase
      .from("listes")
      .select("id, nom")
      .eq("parent_id", context.userId)
      .eq("enfant_id", data.enfantId)
      .order("created_at");
    if (error) throw error;
    return listes as Liste[];
  });

export const ajouterListe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ enfantId: z.string().uuid(), nom: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: liste, error } = await context.supabase
      .from("listes")
      .insert({ parent_id: context.userId, enfant_id: data.enfantId, nom: data.nom.trim() })
      .select("id, nom")
      .single();
    if (error) throw error;
    return liste as Liste;
  });

export const supprimerListe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    // Les mots restent : ils reviennent dans « tous les mots ».
    const { error } = await context.supabase
      .from("listes")
      .delete()
      .eq("id", data.id)
      .eq("parent_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
