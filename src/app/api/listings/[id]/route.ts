import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const listing = await db.listing.findUnique({
    where: { id: params.id },
    include: { photos: true, seller: { select: { fullName: true } } },
  });
  if (!listing) return NextResponse.json({ ok: false, error: "Annonce introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, listing });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Connexion requise" }, { status: 401 });

  const listing = await db.listing.findUnique({ where: { id: params.id } });
  if (!listing || listing.sellerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Annonce introuvable" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!["DISPONIBLE", "EN_NEGOCIATION", "CLOTUREE"].includes(status)) {
    return NextResponse.json({ ok: false, error: "statut_invalide" }, { status: 400 });
  }

  const updated = await db.listing.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ ok: true, listing: updated });
}
