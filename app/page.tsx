import Link from "next/link";

const highlights = [
  {
    title: "Découvrir les communautés",
    description: "Rejoignez des espaces collaboratifs et retrouvez vos groupes de travail.",
  },
  {
    title: "Suivre les projets",
    description: "Organisez les tâches, les livrables et les étapes de validation en un seul endroit.",
  },
  {
    title: "Partager les ressources",
    description: "Centralisez les documents, les notes et les fichiers utiles à l’équipe.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
            Campoignon
          </p>
          <h1 className="text-4xl font-semibold sm:text-6xl">
            Créez, gérez et faites grandir vos communautés de projet.
          </h1>
          <p className="text-lg text-slate-300">
            Une interface simple pour naviguer entre les communautés, organiser les projets
            et partager les informations importantes avec votre équipe.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/choix-communaute"
              className="rounded-full bg-rose-500 px-5 py-3 font-medium text-white transition hover:bg-rose-400"
            >
              Voir les communautés
            </Link>
            <Link
              href="/inscription"
              className="rounded-full border border-white/20 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}