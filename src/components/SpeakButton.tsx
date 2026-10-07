"use client";

// Bouton "🔊 Écouter" — lit un texte à voix haute via l'API navigateur SpeechSynthesis.
// Fonctionne entièrement côté client, sans dépendance réseau. Si le navigateur ne supporte
// pas la synthèse vocale, le bouton se cache simplement (dégradation silencieuse).

export default function SpeakButton({ text, label = "Écouter" }: { text: string; label?: string }) {
  function parler() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={parler}
      className="inline-flex items-center gap-2 rounded-full bg-naya-green px-5 py-3 text-lg font-semibold text-white shadow active:scale-95"
      aria-label={label}
    >
      🔊 {label}
    </button>
  );
}
