"use client";

import { useState } from "react";
import NumericKeypad from "./NumericKeypad";
import SpeakButton from "./SpeakButton";

// Panneau de vérification réutilisable (inscription vendeur ET mise en contact client) :
// deux méthodes toujours disponibles — appel flash (sans saisie) ou code vocal/SMS saisi
// au clavier numérique. En mode démo (fournisseur "dev"), le code est affiché et lu à
// voix haute car aucun SMS/appel réel n'est envoyé.
export default function PhoneVerifyPanel({
  devCode,
  onSubmit,
  enCours,
}: {
  devCode?: string;
  onSubmit: (input: { code?: string; flashConfirmed?: boolean }) => void;
  enCours: boolean;
}) {
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"flash" | "code">("flash");

  return (
    <div className="flex flex-col gap-5">
      {devCode && (
        <div className="rounded-xl2 bg-naya-green/10 border-2 border-naya-green p-4 text-center">
          <p className="text-sm text-naya-ink">Mode démo — votre code est :</p>
          <p className="text-4xl font-extrabold tracking-widest text-naya-green">{devCode}</p>
          <div className="mt-2 flex justify-center">
            <SpeakButton text={`Votre code est ${devCode.split("").join(" ")}`} label="Entendre le code" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("flash")}
          className={`flex-1 rounded-xl2 py-3 font-semibold ${
            mode === "flash" ? "bg-naya-orange text-white" : "bg-white text-naya-ink"
          }`}
        >
          📞 Appel reçu
        </button>
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`flex-1 rounded-xl2 py-3 font-semibold ${
            mode === "code" ? "bg-naya-orange text-white" : "bg-white text-naya-ink"
          }`}
        >
          🔢 Code reçu
        </button>
      </div>

      {mode === "flash" ? (
        <button
          type="button"
          disabled={enCours}
          onClick={() => onSubmit({ flashConfirmed: true })}
          className="rounded-xl2 bg-naya-green py-5 text-xl font-bold text-white shadow active:scale-95 disabled:opacity-50"
        >
          {enCours ? "Vérification..." : "✅ J'ai reçu l'appel, confirmer"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className="text-2xl font-bold tracking-[0.3em] text-naya-ink">
            {code.padEnd(6, "•")}
          </p>
          <NumericKeypad value={code} onChange={setCode} maxLength={6} />
          <button
            type="button"
            disabled={code.length !== 6 || enCours}
            onClick={() => onSubmit({ code })}
            className="w-full rounded-xl2 bg-naya-green py-4 text-xl font-bold text-white shadow active:scale-95 disabled:opacity-50"
          >
            {enCours ? "Vérification..." : "Valider"}
          </button>
        </div>
      )}
    </div>
  );
}
