"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VoiceRecorder from "@/components/VoiceRecorder";
import { CategoryPicker, TransactionTypePicker } from "@/components/CategoryPicker";
import NumericKeypad from "@/components/NumericKeypad";
import DisclaimerBanner from "@/components/DisclaimerBanner";

type Etape = "categorie" | "transaction" | "prix" | "photos" | "voix" | "ville" | "envoi";

export default function NouvelleAnnonceWizard() {
  const router = useRouter();
  const [etape, setEtape] = useState<Etape>("categorie");
  const [category, setCategory] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [prix, setPrix] = useState("");
  const [negociable, setNegociable] = useState(false);
  const [ville, setVille] = useState("");
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [sessionExpiree, setSessionExpiree] = useState(false);
  const [paiementRequis, setPaiementRequis] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function ajouterPhoto(fichier: File) {
    const form = new FormData();
    form.append("file", fichier);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await res.json();
    if (data.ok) setPhotoUrls((prev) => [...prev, data.url].slice(0, 6));
  }

  async function publier(paymentId?: string) {
    setErreur(null);
    setSessionExpiree(false);
    setEnCours(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        transactionType,
        priceAmount: negociable || !prix ? null : Number(prix),
        priceNegotiable: negociable,
        city: ville || undefined,
        voiceNoteUrl,
        photoUrls,
        paymentId,
      }),
    });
    const data = await res.json();
    setEnCours(false);

    if (!data.ok && data.requiresPayment) {
      setPaiementRequis(data.amount);
      return;
    }
    if (res.status === 401) {
      // La session a expiré pendant le parcours (ex: appareil resté ouvert longtemps) —
      // le message générique ne disait pas pourquoi la publication échouait.
      setSessionExpiree(true);
      return;
    }
    if (!data.ok) {
      setErreur("Impossible de publier l'annonce.");
      return;
    }
    router.push(`/annonce/${data.listing.id}`);
  }

  async function payerEtPublier() {
    setEnCours(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "annonce_supplementaire" }),
    });
    const data = await res.json();
    setEnCours(false);
    if (res.status === 401) {
      setSessionExpiree(true);
      return;
    }
    if (!data.ok) {
      setErreur("Paiement refusé.");
      return;
    }
    setPaiementRequis(null);
    await publier(data.payment.id);
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h1 className="text-2xl font-extrabold text-naya-ink">Nouvelle annonce</h1>
      <DisclaimerBanner />

      {etape === "categorie" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Quel type de bien ?</p>
          <CategoryPicker value={category} onChange={setCategory} />
          <button
            type="button"
            disabled={!category}
            onClick={() => setEtape("transaction")}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {etape === "transaction" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Vente, location ou troc ?</p>
          <TransactionTypePicker value={transactionType} onChange={setTransactionType} />
          <button
            type="button"
            disabled={!transactionType}
            onClick={() => setEtape("prix")}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {etape === "prix" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Quel prix (FCFA) ?</p>
          <p className="rounded-xl2 bg-white p-4 text-center text-3xl font-bold">
            {negociable ? "À négocier" : prix || "0"}
          </p>
          <NumericKeypad value={prix} onChange={setPrix} maxLength={9} />
          <button
            type="button"
            onClick={() => setNegociable((v) => !v)}
            className={`rounded-xl2 py-3 font-semibold ${
              negociable ? "bg-naya-green text-white" : "bg-white text-naya-ink"
            }`}
          >
            🔁 Prix à négocier / troc
          </button>
          <button
            type="button"
            onClick={() => setEtape("photos")}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white"
          >
            Suivant
          </button>
        </div>
      )}

      {etape === "photos" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Photos du bien</p>
          <div className="grid grid-cols-3 gap-2">
            {photoUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="h-24 w-full rounded-xl2 object-cover" />
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && ajouterPhoto(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl2 bg-white py-4 text-xl font-bold text-naya-ink shadow"
          >
            📷 Ajouter une photo
          </button>
          <button
            type="button"
            disabled={photoUrls.length === 0}
            onClick={() => setEtape("voix")}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {etape === "voix" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Décrivez le bien à la voix</p>
          <VoiceRecorder onUploaded={setVoiceNoteUrl} />
          <button
            type="button"
            disabled={!voiceNoteUrl}
            onClick={() => setEtape("ville")}
            className="rounded-xl2 bg-naya-orange py-4 text-xl font-bold text-white disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}

      {etape === "ville" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold">Ville / quartier (optionnel)</p>
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ex: Niamey, Plateau"
            className="rounded-xl2 border-2 border-naya-green/40 p-4 text-lg"
          />

          {erreur && <p className="text-center font-semibold text-red-600">{erreur}</p>}

          {sessionExpiree && (
            <div className="flex flex-col gap-3 rounded-xl2 border-2 border-red-400 bg-red-50 p-4 text-center">
              <p className="font-semibold text-red-700">
                Votre session a expiré. Reconnectez-vous pour publier votre annonce.
              </p>
              <Link
                href="/vendeur/connexion"
                className="rounded-xl2 bg-naya-orange py-3 text-lg font-bold text-white"
              >
                Se reconnecter
              </Link>
            </div>
          )}

          {paiementRequis != null ? (
            <div className="flex flex-col gap-3 rounded-xl2 border-2 border-naya-orange bg-naya-orange/10 p-4 text-center">
              <p className="font-semibold">
                Votre quota d'annonces gratuites est atteint. Cette annonce coûte{" "}
                {paiementRequis.toLocaleString("fr-FR")} FCFA.
              </p>
              <button
                type="button"
                disabled={enCours}
                onClick={payerEtPublier}
                className="rounded-xl2 bg-naya-green py-4 text-xl font-bold text-white disabled:opacity-50"
              >
                {enCours ? "Paiement..." : "💳 Payer et publier"}
              </button>
            </div>
          ) : (
            !sessionExpiree && (
              <button
                type="button"
                disabled={enCours}
                onClick={() => publier()}
                className="rounded-xl2 bg-naya-green py-4 text-xl font-bold text-white disabled:opacity-50"
              >
                {enCours ? "Publication..." : "✅ Publier l'annonce"}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
