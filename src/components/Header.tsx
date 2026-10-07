import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-naya-green px-4 py-3 text-white shadow">
      <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-naya-orange text-white">
          N
        </span>
        NaYa
      </Link>
      <nav className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/vendeur/nouvelle-annonce">📢 Publier</Link>
        <Link href="/vendeur/tableau-de-bord">👤 Mon compte</Link>
      </nav>
    </header>
  );
}
