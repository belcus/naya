// Couche d'abstraction fournisseurs — NaYa (Niger)
//
// Pourquoi : la couverture réelle des opérateurs Niger par un fournisseur d'API
// voix/SMS/mobile money n'est pas confirmée (point ouvert du prompt produit).
// Chaque fournisseur est donc caché derrière une interface, avec une implémentation
// "dev" qui simule le comportement localement (aucun appel réseau sortant), afin que
// l'application soit entièrement testable sans dépendre d'identifiants de production.
// Pour brancher un vrai fournisseur (Twilio Verify, Africa's Talking, Orange Money, ...),
// il suffit d'ajouter une classe qui implémente l'interface et de la sélectionner via
// la variable d'environnement correspondante.

import { randomInt } from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

// ---------- OTP / vérification téléphonique ----------

export type OtpChannel = "sms" | "voice_announce" | "voice_flash";

export interface OtpProvider {
  /** Génère et "envoie" un code à 6 chiffres (SMS ou appel vocal qui l'énonce). */
  sendCode(phone: string, code: string, channel: OtpChannel): Promise<void>;
  /** Déclenche un appel flash / manqué — la réception de l'appel suffit à valider. */
  triggerFlashCall(phone: string): Promise<{ callId: string }>;
}

class DevOtpProvider implements OtpProvider {
  async sendCode(phone: string, code: string, channel: OtpChannel): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[DEV OTP] canal=${channel} téléphone=${phone} code=${code}`);
  }
  async triggerFlashCall(phone: string): Promise<{ callId: string }> {
    // eslint-disable-next-line no-console
    console.log(`[DEV FLASH CALL] téléphone=${phone}`);
    return { callId: `dev-call-${Date.now()}` };
  }
}

export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
}

export function getOtpProvider(): OtpProvider {
  const name = process.env.OTP_PROVIDER || "dev";
  switch (name) {
    // TODO production : brancher TwilioOtpProvider (Verify API) ou AfricasTalkingOtpProvider
    // une fois la couverture Niger confirmée.
    default:
      return new DevOtpProvider();
  }
}

// ---------- Mise en contact téléphonique (appel masqué) ----------

export interface CallProvider {
  /** Déclenche un appel entre deux numéros sans jamais exposer les numéros réels. */
  initiateMaskedCall(fromPhone: string, toPhone: string): Promise<{ callId: string }>;
}

class DevCallProvider implements CallProvider {
  async initiateMaskedCall(fromPhone: string, toPhone: string): Promise<{ callId: string }> {
    // eslint-disable-next-line no-console
    console.log(`[DEV CALL MASQUÉ] ${fromPhone} <-> ${toPhone}`);
    return { callId: `dev-bridge-${Date.now()}` };
  }
}

export function getCallProvider(): CallProvider {
  const name = process.env.CALL_PROVIDER || "dev";
  switch (name) {
    // TODO production : brancher un fournisseur de téléphonie (Africa's Talking Voice,
    // ou API directe d'un opérateur Niger) une fois confirmé.
    default:
      return new DevCallProvider();
  }
}

// ---------- Paiement (mobile money) ----------

export interface PaymentCharge {
  amountFcfa: number;
  phone: string;
  label: string;
}

export interface PaymentProvider {
  charge(input: PaymentCharge): Promise<{ status: "confirme" | "echoue"; providerRef: string }>;
}

class DevPaymentProvider implements PaymentProvider {
  async charge(input: PaymentCharge) {
    // En dev, le paiement est toujours confirmé instantanément.
    // eslint-disable-next-line no-console
    console.log(`[DEV PAIEMENT] ${input.amountFcfa} FCFA — ${input.label} — ${input.phone}`);
    return { status: "confirme" as const, providerRef: `dev-pay-${Date.now()}` };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER || "dev";
  switch (name) {
    // TODO production : brancher Orange Money / Moov Money / Airtel Money selon
    // disponibilité réelle d'API au Niger.
    default:
      return new DevPaymentProvider();
  }
}

export function currentPaymentProviderName(): string {
  return process.env.PAYMENT_PROVIDER || "dev";
}

// ---------- Stockage médias (photos + notes vocales) ----------

export interface StorageProvider {
  /** Sauvegarde un fichier binaire et retourne son URL publique. */
  save(buffer: Buffer, filename: string): Promise<string>;
}

class LocalDiskStorageProvider implements StorageProvider {
  async save(buffer: Buffer, filename: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const fullPath = path.join(uploadsDir, filename);
    await writeFile(fullPath, buffer);
    return `/uploads/${filename}`;
  }
}

export function getStorageProvider(): StorageProvider {
  // TODO production : brancher un StorageProvider S3-compatible (Cloudflare R2 /
  // Supabase Storage) — l'interface ci-dessus reste identique.
  return new LocalDiskStorageProvider();
}
