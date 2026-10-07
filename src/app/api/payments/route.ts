import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { paymentSchema } from "@/lib/validation";
import { getPaymentProvider, currentPaymentProviderName } from "@/lib/providers";
import { calculerExpirationBoost } from "@/lib/business";
import {
  PRIX_ANNONCE_SUPPLEMENTAIRE_FCFA,
  PRIX_BOOST_PAR_JOUR_FCFA,
  PRIX_ABONNEMENT_PRO_MENSUEL_FCFA,
} from "@/lib/constants";

function montantPour(type: string, days?: number): number {
  switch (type) {
    case "annonce_supplementaire":
      return PRIX_ANNONCE_SUPPLEMENTAIRE_FCFA;
    case "boost":
      return PRIX_BOOST_PAR_JOUR_FCFA * (days ?? 1);
    case "abonnement_pro":
      return PRIX_ABONNEMENT_PRO_MENSUEL_FCFA;
    default:
      throw new Error("type de paiement inconnu");
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Connexion requise" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { type, listingId, days } = parsed.data;

  if (type === "boost" && !listingId) {
    return NextResponse.json({ ok: false, error: "listingId requis pour un boost" }, { status: 400 });
  }
  if (type === "boost") {
    const listing = await db.listing.findUnique({ where: { id: listingId! } });
    if (!listing || listing.sellerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Annonce introuvable" }, { status: 404 });
    }
  }

  const amount = montantPour(type, days);
  const charge = await getPaymentProvider().charge({
    amountFcfa: amount,
    phone: user.phone,
    label: type,
  });

  const payment = await db.payment.create({
    data: {
      userId: user.id,
      type,
      amount,
      provider: currentPaymentProviderName(),
      status: charge.status,
      relatedListingId: type === "boost" ? listingId : undefined,
    },
  });

  if (charge.status !== "confirme") {
    return NextResponse.json({ ok: false, error: "paiement_echoue", payment }, { status: 402 });
  }

  if (type === "boost" && listingId) {
    await db.listing.update({
      where: { id: listingId },
      data: { isBoosted: true, boostExpiresAt: calculerExpirationBoost(days ?? 1) },
    });
  }

  if (type === "abonnement_pro") {
    await db.user.update({ where: { id: user.id }, data: { plan: "PRO" } });
  }

  return NextResponse.json({ ok: true, payment });
}
