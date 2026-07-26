import Link from "next/link";

export function BarreNavigation() {
  return (
    <header className="border-b bg-white/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Campoignon
        </Link>
        <nav className="flex gap-4 text-sm text-slate-600">
          <Link href="/fonctionnalites">Fonctionnalités</Link>
          <Link href="/communautes">Communautés</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/connexion" className="font-medium text-slate-900">Connexion</Link>
        </nav>
      </div>
    </header>
  );
}
