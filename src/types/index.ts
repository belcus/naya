export type Category = "IMMOBILIER" | "VEHICULE" | "ELECTRONIQUE" | "AUTRE";
export type TransactionType = "VENTE" | "LOCATION" | "TROC";
export type ListingStatus = "DISPONIBLE" | "EN_NEGOCIATION" | "CLOTUREE";

export interface ListingSummary {
  id: string;
  category: Category;
  transactionType: TransactionType;
  priceAmount: number | null;
  priceNegotiable: boolean;
  city: string | null;
  voiceNoteUrl: string;
  status: ListingStatus;
  isBoosted: boolean;
  createdAt: string;
  photos: { id: string; url: string }[];
}

export interface ListingDetail extends ListingSummary {
  seller: { fullName: string };
}

export interface ContactRequestInput {
  listingId: string;
  clientFullName: string;
  clientPhone: string;
  voiceMessageUrl?: string;
}
