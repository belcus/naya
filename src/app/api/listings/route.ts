import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createListingSchema } from "@/lib/validation";
import { peutPublierGratuitement } from "@/lib/business";
import { PRIX_ANNONCE_SUPPLEMENTAIRE_FCFA } from "@/lib/constants";

// Fil d'annonces public — pas d'auth requise (voir prompt : consultation toujours gratuite).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");

  const listings = await db.listing.findMany({
    where: {
      status: { not: "CLOTUREE" },
      ...(category ? { category: category as any } : {}),
      ...(city ? { city: { contains: city } } : {}),
    },
    include: { photos: true },
    orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ ok: true, listings });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Connexion vendeur requise" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const nbAnnoncesGratuitesActives = await db.listing.count({
    where: { sellerId: user.id, isPaid: false, status: { not: "CLOTUREE" } },
  });
  const gratuit = peutPublierGratuitement(
    user.plan as "GRATUIT" | "PRO",
    user.freeQuota,
    nbAnnoncesGratuitesActives
  );

  // isPaid = true signifie "publiée hors quota gratuit" (voir schema.prisma) : donc false
  // tant que l'annonce reste dans le quota gratuit (ou plan PRO), true seulement une fois
  // le paiement d'une annonce supplémentaire validé ci-dessous.
  let isPaid = !gratuit;

  if (!gratuit) {
    // Hors quota : une annonce supplémentaire doit avoir été payée au préalable
    // (voir POST /api/payments, type "annonce_supplementaire").
    if (!data.paymentId) {
      return NextResponse.json(
        {
          ok: false,
          error: "quota_depasse",
          requiresPayment: true,
          amount: PRIX_ANNONCE_SUPPLEMENTAIRE_FCFA,
        },
        { status: 402 }
      );
    }
    const payment = await db.payment.findUnique({ where: { id: data.paymentId } });
    if (
      !payment ||
      payment.userId !== user.id ||
      payment.type !== "annonce_supplementaire" ||
      payment.status !== "confirme" ||
      payment.relatedListingId
    ) {
      return NextResponse.json({ ok: false, error: "paiement_invalide" }, { status: 402 });
    }
    isPaid = true;
  }

  const listing = await db.listing.create({
    data: {
      sellerId: user.id,
      category: data.category,
      transactionType: data.transactionType,
      priceAmount: data.priceNegotiable ? null : data.priceAmount ?? null,
      priceNegotiable: !!data.priceNegotiable,
      city: data.city,
      voiceNoteUrl: data.voiceNoteUrl,
      isPaid,
      photos: data.photoUrls ? { create: data.photoUrls.map((url) => ({ url })) } : undefined,
    },
    include: { photos: true },
  });

  if (data.paymentId) {
    await db.payment.update({ where: { id: data.paymentId }, data: { relatedListingId: listing.id } });
  }

  return NextResponse.json({ ok: true, listing });
}
