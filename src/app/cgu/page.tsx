import SpeakButton from "@/components/SpeakButton";

const TEXTE = `Conditions d'utilisation de NaYa.
NaYa met en relation des personnes qui veulent vendre, louer ou échanger un bien, avec des personnes intéressées.
NaYa ne vend rien, n'achète rien, et ne touche jamais l'argent de la transaction.
NaYa décline toute responsabilité en cas de fraude, de litige, ou de problème avec le bien vendu.
Avant d'acheter ou de louer, vérifiez vous-même les documents et garanties du vendeur.
Les paiements à NaYa (annonce supplémentaire, mise en avant, abonnement) servent uniquement à utiliser le service, jamais à payer le bien lui-même.`;

export default function CguPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-extrabold text-naya-ink">Conditions d'utilisation</h1>
      <SpeakButton text={TEXTE} label="Écouter les conditions" />
      <div className="whitespace-pre-line rounded-xl2 bg-white p-4 text-naya-ink shadow">{TEXTE}</div>
    </div>
  );
}
