"use client";

import { useState } from "react";
import NumericKeypad from "./NumericKeypad";
import PhoneVerifyPanel from "./PhoneVerifyPanel";
import VoiceRecorder from "./VoiceRecorder";

type Etape = "accueil" | "nom" | "telephone" | "verification" | "termine";

// Mise en contact client -> vendeur : un seul bouton "Appeler", confirmation du numéro
// par appel flash ou code, puis appel masqué déclenché côté serveur.
export default function ContactPanel({ listingId }: { listingId: string }) {
  const [etape, setEtape] = useState<Etape>("accueil");
  const [clientFullName, setClientFullName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [voiceMessageUrl, setVoiceMessageUrl] = useState<string | undefined>();
  const [contactRequestId, setContactRequestId] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyerDemande() {
    setErreur(null);
    setEnCours(true);
    const res = await fetch("/api/contact-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, clientFullName, clientPhone, voiceMessageUrl }),
    });
    const data = await res.json();
    setEnCours(false);
    if (!data.ok) {
      setErreur(
        data.error === "vendeur_ne_peut_pas_se_contacter"
          ? "Vous êtes le vendeur de cette annonce : vous ne pouvez pas vous contacter vous-même."
          : "Impossible d'envoyer la demande."
      );
      return;
    }
    setContactRequestId(data.contactRequestId);
    setDevCode(data.devCode);
    setEtape("verification");
  }

  async function verifier(input: { code?: string; flashConfirmed?: boolean }) {
    setErreur(null);
    setEnCours(true);
    const res = await fetch(`/api/contact-requests/${contactRequestId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    setEnCours(false);
    if (!data.ok) {
      setErreur("Code incorrect ou expiré.");
      return;
    }
    setEtape("termine");
  }

  if (etape === "accueil") {
    return (
      <button
        type="button"
        onClick={() => setEtape("nom")}
        className="w-full rounded-xl2 bg-naya-orange py-5 text-2xl font-extrabold text-white shadow active:scale-95"
      >
        📞 Appeler le vendeur
      </button>
    );
  }

  if (etape === "nom") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg font-semibold">Votre nom complet</p>
        <input
          value={clientFullName}
          onChange={(e) => setClientFullName(e.target.value)}
          className="rounded-xl2 border-2 border-naya-green/40 p-4 text-lg"
          placeholder="Nom complet"
        />
        <p className="text-lg font-semibold">Message vocal (optionnel)</p>
        <VoiceRecorder onUploaded={setVoiceMessageUrl} label="Laisser un message au vendeur" />
        <button
          type="button"
          disabled={clientFullName.trim().length < 2}
          onClick={() => setEtape("telephone")}
          className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    );
  }

  if (etape === "telephone") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg font-semibold">Votre numéro de mobile</p>
        <p className="rounded-xl2 bg-white p-4 text-center text-2xl font-bold tracking-wider">
          {clientPhone || "— — — — — — — —"}
        </p>
        <NumericKeypad value={clientPhone} onChange={setClientPhone} maxLength={9} />
        {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}
        <button
          type="button"
          disabled={clientPhone.length < 8 || enCours}
          onClick={envoyerDemande}
          className="rounded-xl2 bg-naya-green py-4 text-xl font-bold text-white disabled:opacity-50"
        >
          {enCours ? "Envoi..." : "Confirmer"}
        </button>
      </div>
    );
  }

  if (etape === "verification") {
    return (
      <div className="flex flex-col gap-4">
        {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}
        <PhoneVerifyPanel devCode={devCode} onSubmit={verifier} enCours={enCours} />
      </div>
    );
  }

  return (
    <div className="rounded-xl2 bg-naya-green/10 border-2 border-naya-green p-5 text-center">
      <p className="text-xl font-bold text-naya-green">✅ Mise en contact en cours</p>
      <p className="mt-2 text-naya-ink">Le vendeur va vous appeler très bientôt.</p>
    </div>
  );
}
