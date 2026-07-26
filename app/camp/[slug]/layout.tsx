import Link from "next/link";
import Image from "next/image";

export default async function CampLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0204]">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0204]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Campoignon"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="text-sm font-bold text-white">Campoignon</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: "Tableau de bord", href: `/camp/${slug}/tableau-de-board` },
              { label: "Projets", href: `/camp/${slug}/projets` },
              { label: "Communauté", href: `/camp/${slug}/communaute` },
              { label: "Profil", href: `/camp/${slug}/profil` },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/choix-communaute"
              className="hidden text-sm font-medium text-white/40 transition-colors hover:text-white/70 sm:inline-block"
            >
              Changer
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              Accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
