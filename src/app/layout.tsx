import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "NaYa — Vendre, louer, échanger directement",
  description:
    "NaYa met en relation directe vendeurs et clients au Niger, sans intermédiaire. Publiez et contactez à la voix.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0DB02B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      {/* Police système (aucune dépendance réseau) — cf. contrainte sandbox hors-ligne */}
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main className="mx-auto max-w-md pb-10">{children}</main>
      </body>
    </html>
  );
}
