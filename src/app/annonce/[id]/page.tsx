import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";
import { formaterPrixFcfa, estLeMemeNumero } from "@/lib/business";
import { getCurrentUser } from "@/lib/session";
import SpeakButton from "@/components/SpeakButton";
import ContactPanel from "@/components/ContactPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default async function AnnoncePage({ params }: { params: { id: string } }) {
  const listing = await db.listing.findUnique({
    where: { id: params.id },
    include: { photos: true, seller: { select: { fullName: true, phone: true } } },
  });
  if (!listing) notFound();

  // Le vendeur qui a publié l'annonce ne peut pas se contacter lui-même — on masque
  // directement le bouton "Appeler" plutôt que de le laisser échouer en fin de parcours.
  const currentUser = await getCurrentUser();
  const estLeVendeur = !!currentUser && estLeMemeNumero(currentUser.phone, listing.seller.phone);

  const categorie = CATEGORIES.find((c) => c.value === listing.category);
  const prixTexte = formaterPrixFcfa(listing.priceAmount, listing.priceNegotiable);
  const texteAnnonce = `${categorie?.label}. Prix : ${prixTexte}.${
    listing.city ? ` Ville : ${listing.city}.` : ""
  }`;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-3 gap-2">
        {listing.photos.length > 0 ? (
          listing.photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.url} alt="" className="h-28 w-full rounded-xl2 object-cover" />
          ))
        ) : (
          <div className="col-span-3 flex h-28 items-center justify-center rounded-xl2 bg-naya-green/10 text-6xl">
            {categorie?.emoji}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-naya-ink/80">
          {categorie?.emoji} {categorie?.label}
        </span>
        {listing.isBoosted && (
          <span className="rounded-full bg-naya-orange px-3 py-1 text-xs font-bold text-white">
            ⭐ En avant
          </span>
        )}
      </div>

      <p className="text-3xl font-extrabold text-naya-orange">{prixTexte}</p>
      {listing.city && <p className="text-naya-ink/70">📍 {listing.city}</p>}

      <div className="flex items-center gap-3 rounded-xl2 bg-white p-4 shadow">
        <audio controls src={listing.voiceNoteUrl} className="w-full">
          <track kind="captions" />
        </audio>
      </div>
      <SpeakButton text={texteAnnonce} label="Lire les détails" />

      <DisclaimerBanner />

      {estLeVendeur ? (
        <p className="rounded-xl2 bg-naya-ink/5 p-4 text-center font-semibold text-naya-ink/70">
          C'est votre annonce — vous ne pouvez pas vous contacter vous-même.
        </p>
      ) : (
        <ContactPanel listingId={listing.id} />
      )}
    </div>
  );
}
