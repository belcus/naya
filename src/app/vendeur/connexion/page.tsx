"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NumericKeypad from "@/components/NumericKeypad";
import PhoneVerifyPanel from "@/components/PhoneVerifyPanel";

export default function ConnexionPage() {
  const router = useRouter();
  const [etape, setEtape] = useState<"phone" | "verification">("phone");
  const [phone, setPhone] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer() {
    setErreur(null);
    setEnCours(true);
    const res = await fetch("/api/sellers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setEnCours(false);
    if (!data.ok) {
      setErreur("Compte introuvable pour ce numéro.");
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
      setErreur("Code incorrect ou expiré.");
      return;
    }
    router.push("/vendeur/tableau-de-bord");
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-2xl font-extrabold text-naya-ink">Connexion vendeur</h1>

      {etape === "phone" ? (
        <div className="flex flex-col gap-4">
          <span className="text-lg font-semibold">Votre numéro de mobile</span>
          <p className="rounded-xl2 bg-white p-4 text-center text-2xl font-bold tracking-wider">
            {phone || "— — — — — — — —"}
          </p>
          <NumericKeypad value={phone} onChange={setPhone} maxLength={9} />
          {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}
          <button
            type="button"
            disabled={phone.length < 8 || enCours}
            onClick={envoyer}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white shadow active:scale-95 disabled:opacity-50"
          >
            {enCours ? "Envoi..." : "Continuer"}
          </button>
          <p className="text-center text-sm text-naya-ink/70">
            Pas encore de compte ?{" "}
            <Link href="/vendeur/inscription" className="font-semibold text-naya-green">
              S'inscrire
            </Link>
          </p>
        </div>
      ) : (
        <>
          {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}
          <PhoneVerifyPanel devCode={devCode} onSubmit={verifier} enCours={enCours} />
        </>
      )}
    </div>
  );
}
