import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactRequestSchema } from "@/lib/validation";
import { generateOtpCode, getOtpProvider } from "@/lib/providers";
import { OTP_EXPIRATION_MINUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/session";
import { estLeMemeNumero } from "@/lib/business";

// Demandes de contact reçues par le vendeur connecté, toutes ses annonces confondues.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Connexion requise" }, { status: 401 });

  const requests = await db.contactRequest.findMany({
    where: { listing: { sellerId: user.id } },
    include: { listing: { select: { id: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, requests });
}

// Un client n'a pas de compte NaYa : la vérification se fait uniquement sur le numéro
// fourni pour cette demande (voir /api/contact-requests/[id]/verify).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  const { listingId, clientFullName, clientPhone } = parsed.data;

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { phone: true } } },
  });
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Annonce introuvable" }, { status: 404 });
  }

  // Règle métier : le vendeur qui a publié le bien ne peut pas se contacter lui-même.
  if (estLeMemeNumero(clientPhone, listing.seller.phone)) {
    return NextResponse.json(
      { ok: false, error: "vendeur_ne_peut_pas_se_contacter" },
      { status: 403 }
    );
  }

  const contactRequest = await db.contactRequest.create({
    data: { listingId, clientFullName, clientPhone },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
  await db.otpCode.create({
    data: { phone: clientPhone, code, channel: "voice_announce", expiresAt },
  });

  const provider = getOtpProvider();
  await provider.sendCode(clientPhone, code, "voice_announce");
  await provider.sendCode(clientPhone, code, "sms");
  await provider.triggerFlashCall(clientPhone);

  const isDev = (process.env.OTP_PROVIDER || "dev") === "dev";
  return NextResponse.json({
    ok: true,
    contactRequestId: contactRequest.id,
    devCode: isDev ? code : undefined,
  });
}
