import Image from "next/image";
import Link from "next/link";

export function PiedPage() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0c0204]">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
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
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/30">
              Vigne &amp; Voyages. La plateforme communautaire qui structure vos
              projets et garde la trace de chaque avancée.
            </p>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Plateforme
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Fonctionnalités", href: "/#features" },
                { label: "Communautés", href: "/choix-communaute" },
                { label: "Compagnon IA", href: "/a-propos" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/35 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Légal
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Conditions d&apos;utilisation", href: "#" },
                { label: "Politique de confidentialité", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/35 transition-colors hover:text-white/70"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
              Compte
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/connexion"
                  className="text-sm text-white/35 transition-colors hover:text-white/70"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/inscription"
                  className="text-sm text-white/35 transition-colors hover:text-white/70"
                >
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Campoignon. Tous droits réservés.
          </p>
          <p className="text-xs text-white/15">Vigne &amp; Voyages</p>
        </div>
      </div>
    </footer>
  );
}
