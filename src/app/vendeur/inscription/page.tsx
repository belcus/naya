"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NumericKeypad from "@/components/NumericKeypad";
import PhoneVerifyPanel from "@/components/PhoneVerifyPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import SpeakButton from "@/components/SpeakButton";

export default function InscriptionPage() {
  const router = useRouter();
  const [etape, setEtape] = useState<"infos" | "verification">("infos");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyerInscription() {
    setErreur(null);
    setEnCours(true);
    const res = await fetch("/api/sellers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone }),
    });
    const data = await res.json();
    setEnCours(false);
    if (!data.ok) {
      setErreur("Impossible de continuer. Vérifiez le nom et le numéro.");
      return;
    }
    setDevCode(data.devCode);
    setEtape("verification");
  }

  async function verifier(input: { code?: string; flashConfirmed?: boolean }) {
    setErreur(null);
    setEnCours(true);
    const res = await fetch("/api/sellers/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, ...input }),
    });
    const data = await res.json();
    setEnCours(false);
    if (!data.ok) {
      setErreur("Code incorrect ou expiré. Réessayez.");
      return;
    }
    router.push("/vendeur/tableau-de-bord");
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-2xl font-extrabold text-naya-ink">Inscription vendeur</h1>
      <DisclaimerBanner />

      {etape === "infos" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Votre nom complet</span>
            <SpeakButton text="Entrez votre nom complet" label="" />
          </div>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nom complet"
            className="rounded-xl2 border-2 border-naya-green/40 p-4 text-lg"
          />

          <span className="text-lg font-semibold">Votre numéro de mobile</span>
          <p className="rounded-xl2 bg-white p-4 text-center text-2xl font-bold tracking-wider">
            {phone || "— — — — — — — —"}
          </p>
          <NumericKeypad value={phone} onChange={setPhone} maxLength={9} />

          {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}

          <button
            type="button"
            disabled={fullName.trim().length < 2 || phone.length < 8 || enCours}
            onClick={envoyerInscription}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white shadow active:scale-95 disabled:opacity-50"
          >
            {enCours ? "Envoi..." : "S'inscrire"}
          </button>
        </div>
      ) : (
        <>
          <p className="text-center text-naya-ink/80">
            Nous vous appelons ou vous envoyons un code au {phone}.
          </p>
          {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}
          <PhoneVerifyPanel devCode={devCode} onSubmit={verifier} enCours={enCours} />
        </>
      )}
    </div>
  );
}
