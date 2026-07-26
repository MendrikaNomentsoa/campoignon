import Link from "next/link";

export default async function CampLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href={`/camp/${slug}`} className="text-lg font-semibold text-slate-900">Camp</Link>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href={`/camp/${slug}/tableau-de-bord`}>Tableau de bord</Link>
            <Link href={`/camp/${slug}/projets`}>Projets</Link>
            <Link href={`/camp/${slug}/communaute`}>Communauté</Link>
            <Link href={`/camp/${slug}/profil`}>Profil</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
