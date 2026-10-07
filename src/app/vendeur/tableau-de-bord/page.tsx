import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export default async function TableauDeBordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/vendeur/connexion");

  const [listings, contactRequests, nbAnnoncesGratuitesActives] = await Promise.all([
    db.listing.findMany({ where: { sellerId: user.id }, orderBy: { createdAt: "desc" } }),
    db.contactRequest.findMany({
      where: { listing: { sellerId: user.id } },
      include: { listing: { select: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.listing.count({ where: { sellerId: user.id, isPaid: false, status: { not: "CLOTUREE" } } }),
  ]);

  return (
    <DashboardClient
      user={{
        fullName: user.fullName,
        phone: user.phone,
        plan: user.plan,
        freeQuota: user.freeQuota,
        nbAnnoncesGratuitesActives,
      }}
      listings={listings as any}
      contactRequests={contactRequests as any}
    />
  );
}
