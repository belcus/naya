import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { formaterPrixFcfa } from "@/lib/business";
import type { ListingSummary } from "@/types";

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  const categorie = CATEGORIES.find((c) => c.value === listing.category);
  const photo = listing.photos[0]?.url;

  return (
    <Link
      href={`/annonce/${listing.id}`}
      className="flex flex-col overflow-hidden rounded-xl2 bg-white shadow transition active:scale-[0.98]"
    >
      <div className="relative h-40 w-full bg-naya-green/10">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            {categorie?.emoji ?? "📦"}
          </div>
        )}
        {listing.isBoosted && (
          <span className="absolute left-2 top-2 rounded-full bg-naya-orange px-3 py-1 text-xs font-bold text-white">
            ⭐ En avant
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="text-sm text-naya-ink/70">
          {categorie?.emoji} {categorie?.label}
        </span>
        <span className="text-lg font-bold text-naya-orange">
          {formaterPrixFcfa(listing.priceAmount, listing.priceNegotiable)}
        </span>
        {listing.city && <span className="text-sm text-naya-ink/70">📍 {listing.city}</span>}
      </div>
    </Link>
  );
}
