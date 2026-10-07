// Constantes produit NaYa.
// Les montants ci-dessous sont des valeurs de départ raisonnables pour le Niger (FCFA),
// à ajuster après étude de marché — voir "Points ouverts" du prompt produit.

export const QUOTA_ANNONCES_GRATUITES = 3;
export const PRIX_ANNONCE_SUPPLEMENTAIRE_FCFA = 200;
export const PRIX_BOOST_PAR_JOUR_FCFA = 100;
export const PRIX_ABONNEMENT_PRO_MENSUEL_FCFA = 5000;

export const OTP_EXPIRATION_MINUTES = 10;
export const OTP_MAX_TENTATIVES = 5;
export const OTP_LONGUEUR = 6;

export const CATEGORIES = [
  { value: "IMMOBILIER", label: "Immobilier", emoji: "🏠" },
  { value: "VEHICULE", label: "Véhicule", emoji: "🚗" },
  { value: "ELECTRONIQUE", label: "Électronique", emoji: "📺" },
  { value: "AUTRE", label: "Autre", emoji: "📦" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "VENTE", label: "Vente", emoji: "💰" },
  { value: "LOCATION", label: "Location", emoji: "🔑" },
  { value: "TROC", label: "Troc", emoji: "🔁" },
] as const;

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "naya_session";
export const SESSION_DURATION_DAYS = 30;
