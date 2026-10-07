"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { formaterPrixFcfa } from "@/lib/business";

interface ListingLite {
  id: string;
  category: string;
  priceAmount: number | null;
  priceNegotiable: boolean;
  status: string;
  isBoosted: boolean;
}

interface ContactRequestLite {
  id: string;
  clientFullName: string;
  clientPhone: string;
  status: string;
  createdAt: string;
  listing: { category: string };
}

export default function DashboardClient({
  user,
  listings,
  contactRequests,
}: {
  user: { fullName: string; phone: string; plan: string; freeQuota: number; nbAnnoncesGratuitesActives: number };
  listings: ListingLite[];
  contactRequests: ContactRequestLite[];
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState<string | null>(null);

  async function deconnexion() {
    await fetch("/api/sellers/logout", { method: "POST" });
    router.push("/");
  }

  async function changerStatut(listingId: string, status: string) {
    setEnCours(listingId);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setEnCours(null);
    router.refresh();
  }

  async function booster(listingId: string) {
    setEnCours(listingId);
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "boost", listingId, days: 3 }),
    });
    setEnCours(null);
    router.refresh();
  }

  async function passerPro() {
    setEnCours("pro");
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "abonnement_pro" }),
    });
    setEnCours(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="rounded-xl2 bg-naya-green/10 border-2 border-naya-green p-4">
        <p className="text-xl font-bold">{user.fullName}</p>
        <p className="text-naya-ink/70">{user.phone}</p>
        <p className="mt-2 text-sm">
          Plan : <span className="font-semibold">{user.plan === "PRO" ? "Professionnel" : "Gratuit"}</span>
        </p>
        {user.plan !== "PRO" && (
          <>
            <p className="text-sm">
              Annonces gratuites utilisées : {user.nbAnnoncesGratuitesActives} / {user.freeQuota}
            </p>
            <button
              type="button"
              disabled={enCours === "pro"}
              onClick={passerPro}
              className="mt-3 w-full rounded-xl2 bg-naya-orange py-3 font-bold text-white disabled:opacity-50"
            >
              ⭐ Passer Professionnel (annonces illimitées)
            </button>
          </>
        )}
        <button type="button" onClick={deconnexion} className="mt-3 text-sm font-semibold text-naya-ink/60">
          Se déconnecter
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold">Mes annonces</h2>
        {listings.length === 0 && <p className="text-naya-ink/60">Aucune annonce publiée.</p>}
        <div className="flex flex-col gap-3">
          {listings.map((l) => {
            const categorie = CATEGORIES.find((c) => c.value === l.category);
            return (
              <div key={l.id} className="rounded-xl2 bg-white p-3 shadow">
                <div className="flex items-center justify-between">
                  <span>
                    {categorie?.emoji} {formaterPrixFcfa(l.priceAmount, l.priceNegotiable)}
                  </span>
                  {l.isBoosted && <span className="text-xs font-bold text-naya-orange">⭐ Boostée</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    disabled={enCours === l.id}
                    onClick={() => changerStatut(l.id, "DISPONIBLE")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      l.status === "DISPONIBLE" ? "bg-naya-green text-white" : "bg-naya-green/10"
                    }`}
                  >
                    Disponible
                  </button>
                  <button
                    disabled={enCours === l.id}
                    onClick={() => changerStatut(l.id, "EN_NEGOCIATION")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      l.status === "EN_NEGOCIATION" ? "bg-naya-orange text-white" : "bg-naya-orange/10"
                    }`}
                  >
                    En négociation
                  </button>
                  <button
                    disabled={enCours === l.id}
                    onClick={() => changerStatut(l.id, "CLOTUREE")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      l.status === "CLOTUREE" ? "bg-naya-ink text-white" : "bg-naya-ink/10"
                    }`}
                  >
                    Clôturée
                  </button>
                  {!l.isBoosted && (
                    <button
                      disabled={enCours === l.id}
                      onClick={() => booster(l.id)}
                      className="rounded-full bg-naya-orange px-3 py-1 text-xs font-bold text-white"
                    >
                      ⭐ Booster 3 jours
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold">Demandes de contact reçues</h2>
        {contactRequests.length === 0 && <p className="text-naya-ink/60">Aucune demande pour le moment.</p>}
        <div className="flex flex-col gap-3">
          {contactRequests.map((r) => (
            <div key={r.id} className="rounded-xl2 bg-white p-3 shadow">
              <p className="font-semibold">{r.clientFullName}</p>
              <p className="text-naya-ink/70">{r.clientPhone}</p>
              <p className="text-xs text-naya-ink/50">{r.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
