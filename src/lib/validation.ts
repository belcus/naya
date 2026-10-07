import { z } from "zod";

// Validation aux frontières du système (entrées API) — pas de validation interne superflue.

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Numéro de mobile trop court")
  .max(15, "Numéro de mobile trop long")
  .regex(/^[0-9+ ]+$/, "Numéro de mobile invalide");

export const registerSellerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
});

export const verifySchema = z
  .object({
    phone: phoneSchema,
    code: z.string().length(6).optional(),
    flashConfirmed: z.boolean().optional(),
  })
  .refine((data) => !!data.code || !!data.flashConfirmed, {
    message: "code ou flashConfirmed requis",
  });

export const createListingSchema = z.object({
  category: z.enum(["IMMOBILIER", "VEHICULE", "ELECTRONIQUE", "AUTRE"]),
  transactionType: z.enum(["VENTE", "LOCATION", "TROC"]),
  priceAmount: z.number().int().positive().nullable().optional(),
  priceNegotiable: z.boolean().optional(),
  city: z.string().trim().max(100).optional(),
  voiceNoteUrl: z.string().min(1),
  photoUrls: z.array(z.string()).max(6).optional(),
  paymentId: z.string().optional(),
});

export const contactRequestSchema = z.object({
  listingId: z.string().min(1),
  clientFullName: z.string().trim().min(2).max(100),
  clientPhone: phoneSchema,
});

export const contactVerifySchema = z
  .object({
    code: z.string().length(6).optional(),
    flashConfirmed: z.boolean().optional(),
  })
  .refine((data) => !!data.code || !!data.flashConfirmed, {
    message: "code ou flashConfirmed requis",
  });

export const paymentSchema = z.object({
  type: z.enum(["annonce_supplementaire", "boost", "abonnement_pro"]),
  listingId: z.string().optional(),
  days: z.number().int().positive().max(30).optional(),
});
