"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  FileText,
  Rocket,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  fetchCommunity,
  getCommunityStyle,
  type CommunityData,
} from "@/lib/communityStyles";

const sections = [
  {
    id: "publications",
    label: "Publications",
    description: "Partagez et découvrez les publications de la communauté",
    icon: FileText,
    gradient: "from-[#a92940] to-[#d8699e]",
    href: (slug: string) => `/camp/${slug}/communaute/publications`,
  },
  {
    id: "discussions",
    label: "Discussions",
    description: "Échangez en temps réel avec les membres",
    icon: MessageSquare,
    gradient: "from-[#62121b] to-[#a92940]",
    href: (slug: string) => `/camp/${slug}/communaute/discussions`,
  },
  {
    id: "membres",
    label: "Membres",
    description: "Découvrez qui fait partie de la communauté",
    icon: Users,
    gradient: "from-[#d8699e] to-[#a92940]",
    href: (slug: string) => `/camp/${slug}/communaute/membres`,
  },
  {
    id: "projets",
    label: "Projets",
    description: "Lancez ou explorez des projets collaboratifs",
    icon: Rocket,
    gradient: "from-[#a92940] to-[#62121b]",
    href: (slug: string) => `/camp/${slug}/projets`,
  },
];

export default function CampPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [communaute, setCommunaute] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunity(slug).then((data) => {
      setCommunaute(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 text-foreground/40 animate-spin" />
      </div>
    );
  }

  if (!communaute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-foreground/50">Communauté introuvable</p>
          <Link
            href="/choix-communaute"
            className="mt-3 inline-block text-sm text-[#a92940] dark:text-[#d8699e] hover:underline"
          >
            Retour aux communautés
          </Link>
        </div>
      </div>
    );
  }

  const style = getCommunityStyle(communaute.name);
  const Icone = style.icone;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Back */}
        <button
          onClick={() => router.push("/choix-communaute")}
          className="flex items-center gap-2 text-sm text-foreground/30 transition-colors hover:text-foreground/60"
        >
          <ArrowLeft className="size-4" />
          Retour aux communautés
        </button>

        {/* Community header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-8"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-[0.06]`}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.couleur} shadow-lg`}
              >
                <Icone className="size-7 text-white" />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/30">
                  Communauté
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  {communaute.name}
                </h1>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-foreground/45">
              {communaute.description || style.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-foreground/30">
              <Users className="size-3.5" />
              {communaute.membres.toLocaleString()} membre
              {communaute.membres > 1 ? "s" : ""}
            </div>
          </div>
        </motion.div>

        {/* Section grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link
                  href={s.href(slug)}
                  className="group block rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-6 transition-all duration-300 hover:border-[#a92940]/20 hover:bg-foreground/[0.04]"
                >
                  <div
                    className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="size-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-[#a92940] dark:group-hover:text-[#f6dce9] transition-colors">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/35">{s.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
