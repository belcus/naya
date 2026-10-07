// Règles métier pures (sans accès base de données) — testables unitairement.
import { OTP_MAX_TENTATIVES } from "./constants";

export type SellerPlan = "GRATUIT" | "PRO";

export function peutPublierGratuitement(
  plan: SellerPlan,
  freeQuota: number,
  nbAnnoncesGratuitesActives: number
): boolean {
  if (plan === "PRO") return true;
  return nbAnnoncesGratuitesActives < freeQuota;
}

export function calculerExpirationBoost(joursBoost: number, depuis: Date = new Date()): Date {
  if (joursBoost <= 0) throw new Error("joursBoost doit être positif");
  return new Date(depuis.getTime() + joursBoost * 24 * 60 * 60 * 1000);
}

export interface OtpRecordLike {
  code: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
}

export type OtpCheckResult =
  | { ok: true }
  | { ok: false; reason: "expire" | "deja_utilise" | "trop_de_tentatives" | "code_invalide" };

export function verifierCodeOtp(
  record: OtpRecordLike | null,
  codeSaisi: string,
  maintenant: Date = new Date()
): OtpCheckResult {
  if (!record) return { ok: false, reason: "code_invalide" };
  if (record.consumedAt) return { ok: false, reason: "deja_utilise" };
  if (record.expiresAt < maintenant) return { ok: false, reason: "expire" };
  if (record.attempts >= OTP_MAX_TENTATIVES) return { ok: false, reason: "trop_de_tentatives" };
  if (record.code !== codeSaisi) return { ok: false, reason: "code_invalide" };
  return { ok: true };
}

export function formaterPrixFcfa(montant: number | null, negociable: boolean): string {
  if (negociable || montant == null) return "À négocier";
  return `${montant.toLocaleString("fr-FR")} FCFA`;
}

// Ignore espaces/symboles pour comparer deux numéros saisis sous des formats différents.
export function normaliserTelephone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

// Les numéros mobiles au Niger ont 8 chiffres significatifs ; un même numéro peut être
// saisi avec ou sans l'indicatif pays (+227). On compare donc les 8 derniers chiffres
// plutôt que la chaîne complète, pour ne pas laisser un indicatif différent masquer
// qu'il s'agit du même numéro (ex: "+227 96123456" et "96123456").
const LONGUEUR_NUMERO_LOCAL = 8;

export function estLeMemeNumero(a: string, b: string): boolean {
  const normA = normaliserTelephone(a);
  const normB = normaliserTelephone(b);
  if (!normA || !normB) return false;
  return normA.slice(-LONGUEUR_NUMERO_LOCAL) === normB.slice(-LONGUEUR_NUMERO_LOCAL);
}
