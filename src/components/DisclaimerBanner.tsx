import SpeakButton from "./SpeakButton";

const TEXTE_DISCLAIMER =
  "NaYa met seulement les personnes en contact. NaYa n'est pas responsable en cas de fraude. " +
  "Avant toute vente ou tout achat, vérifiez vous-même les garanties du vendeur.";

// Rappel légal — toujours visible ET lisible à voix haute (accessibilité non-lettrés).
export default function DisclaimerBanner() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl2 bg-naya-orange/10 border-2 border-naya-orange p-4">
      <p className="text-sm text-naya-ink">{TEXTE_DISCLAIMER}</p>
      <SpeakButton text={TEXTE_DISCLAIMER} label="" />
    </div>
  );
}

export { TEXTE_DISCLAIMER };
