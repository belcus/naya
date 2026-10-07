import Link from "next/link";
import { db } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { CATEGORIES } from "@/lib/constants";
import type { ListingSummary } from "@/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const listings = await db.listing.findMany({
    where: {
      status: { not: "CLOTUREE" },
      ...(searchParams.category ? { category: searchParams.category as any } : {}),
    },
    include: { photos: true },
    orderBy: [{ isBoosted: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <DisclaimerBanner />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href="/"
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            !searchParams.category ? "bg-naya-orange text-white" : "bg-white text-naya-ink"
          }`}
        >
          Tout
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/?category=${c.value}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              searchParams.category === c.value ? "bg-naya-orange text-white" : "bg-white text-naya-ink"
            }`}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="py-10 text-center text-naya-ink/60">Aucune annonce pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing as unknown as ListingSummary} />
          ))}
        </div>
      )}
    </div>
  );
}
