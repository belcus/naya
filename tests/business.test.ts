import { describe, it, expect } from "vitest";
import {
  peutPublierGratuitement,
  calculerExpirationBoost,
  verifierCodeOtp,
  formaterPrixFcfa,
  estLeMemeNumero,
} from "../src/lib/business";

describe("peutPublierGratuitement", () => {
  it("autorise sous le quota", () => {
    expect(peutPublierGratuitement("GRATUIT", 3, 2)).toBe(true);
  });
  it("refuse au quota atteint", () => {
    expect(peutPublierGratuitement("GRATUIT", 3, 3)).toBe(false);
  });
  it("autorise toujours en plan PRO", () => {
    expect(peutPublierGratuitement("PRO", 3, 50)).toBe(true);
  });
});

describe("calculerExpirationBoost", () => {
  it("ajoute le bon nombre de jours", () => {
    const depart = new Date("2026-01-01T00:00:00.000Z");
    const expiration = calculerExpirationBoost(3, depart);
    expect(expiration.toISOString()).toBe("2026-01-04T00:00:00.000Z");
  });
  it("rejette une durée non positive", () => {
    expect(() => calculerExpirationBoost(0)).toThrow();
  });
});

describe("verifierCodeOtp", () => {
  const maintenant = new Date("2026-01-01T12:00:00.000Z");
  const base = { code: "123456", consumedAt: null, attempts: 0 };

  it("valide un code correct et non expiré", () => {
    const record = { ...base, expiresAt: new Date("2026-01-01T12:05:00.000Z") };
    expect(verifierCodeOtp(record, "123456", maintenant)).toEqual({ ok: true });
  });

  it("refuse un code expiré", () => {
    const record = { ...base, expiresAt: new Date("2026-01-01T11:00:00.000Z") };
    expect(verifierCodeOtp(record, "123456", maintenant)).toEqual({ ok: false, reason: "expire" });
  });

  it("refuse un code déjà consommé", () => {
    const record = {
      ...base,
      expiresAt: new Date("2026-01-01T12:05:00.000Z"),
      consumedAt: new Date("2026-01-01T11:59:00.000Z"),
    };
    expect(verifierCodeOtp(record, "123456", maintenant)).toEqual({ ok: false, reason: "deja_utilise" });
  });

  it("refuse après trop de tentatives", () => {
    const record = { ...base, expiresAt: new Date("2026-01-01T12:05:00.000Z"), attempts: 5 };
    expect(verifierCodeOtp(record, "123456", maintenant)).toEqual({
      ok: false,
      reason: "trop_de_tentatives",
    });
  });

  it("refuse un code incorrect", () => {
    const record = { ...base, expiresAt: new Date("2026-01-01T12:05:00.000Z") };
    expect(verifierCodeOtp(record, "000000", maintenant)).toEqual({ ok: false, reason: "code_invalide" });
  });

  it("refuse quand aucun code n'existe", () => {
    expect(verifierCodeOtp(null, "123456", maintenant)).toEqual({ ok: false, reason: "code_invalide" });
  });
});

describe("formaterPrixFcfa", () => {
  it("affiche 'À négocier' si négociable", () => {
    expect(formaterPrixFcfa(10000, true)).toBe("À négocier");
  });
  it("affiche 'À négocier' si montant nul", () => {
    expect(formaterPrixFcfa(null, false)).toBe("À négocier");
  });
  it("formate un montant FCFA", () => {
    // Normalise les espaces (toLocaleString peut utiliser une espace fine insécable
    // selon l'ICU du runtime) pour ne pas dépendre d'un caractère précis.
    const resultat = formaterPrixFcfa(15000, false).replace(/\s/g, " ");
    expect(resultat).toBe("15 000 FCFA");
  });
});

describe("estLeMemeNumero", () => {
  it("reconnaît deux numéros identiques", () => {
    expect(estLeMemeNumero("96123456", "96123456")).toBe(true);
  });
  it("ignore les espaces et le +227", () => {
    expect(estLeMemeNumero("+227 96 12 34 56", "96123456")).toBe(true);
  });
  it("distingue deux numéros différents", () => {
    expect(estLeMemeNumero("96123456", "90000000")).toBe(false);
  });
});
