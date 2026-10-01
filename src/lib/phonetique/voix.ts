import { useEffect, useState } from "react";

/**
 * Prononciation du mot.
 * Pour le prototype : synthèse vocale du navigateur, en français.
 * Plus tard : enregistrements audio, écoute d'un son isolé, dictée.
 */

export function voixDisponible(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function prononcer(texte: string, vitesse = 0.85): void {
  if (!voixDisponible() || !texte) return;
  window.speechSynthesis.cancel();
  const message = new SpeechSynthesisUtterance(texte);
  message.lang = "fr-FR";
  message.rate = vitesse;
  const voixFr = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang.toLowerCase().startsWith("fr"));
  if (voixFr) message.voice = voixFr;
  window.speechSynthesis.speak(message);
}

/**
 * Hook : évite les différences entre le rendu serveur et le navigateur.
 */
export function useVoixDisponible(): boolean {
  const [dispo, setDispo] = useState(false);
  useEffect(() => setDispo(voixDisponible()), []);
  return dispo;
}
