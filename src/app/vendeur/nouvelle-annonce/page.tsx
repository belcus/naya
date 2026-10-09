import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import NouvelleAnnonceWizard from "@/components/NouvelleAnnonceWizard";

// Garde d'authentification : évite qu'un vendeur non connecté passe par tout le parcours
// (catégorie, photos, note vocale) avant d'échouer silencieusement à la publication.
export default async function NouvelleAnnoncePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/vendeur/connexion");

  return <NouvelleAnnonceWizard />;
}
