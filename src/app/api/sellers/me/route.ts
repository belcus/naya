import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, user: null }, { status: 200 });

  const nbAnnoncesGratuitesActives = await db.listing.count({
    where: { sellerId: user.id, isPaid: false, status: { not: "CLOTUREE" } },
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      plan: user.plan,
      freeQuota: user.freeQuota,
      nbAnnoncesGratuitesActives,
    },
  });
}
