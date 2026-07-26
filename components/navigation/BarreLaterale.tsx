import Link from "next/link";

export function BarreLaterale() {
  return (
    <aside className="w-64 border-r bg-slate-900 p-6 text-white">
      <h2 className="mb-6 text-lg font-semibold">Navigation</h2>
      <nav className="flex flex-col gap-3 text-sm">
        <Link href="/camp/demo/tableau-de-bord">Tableau de bord</Link>
        <Link href="/camp/demo/projets">Projets</Link>
        <Link href="/camp/demo/communaute">Communauté</Link>
        <Link href="/camp/demo/recherche">Recherche</Link>
        <Link href="/camp/demo/profil">Profil</Link>
      </nav>
    </aside>
  );
}
