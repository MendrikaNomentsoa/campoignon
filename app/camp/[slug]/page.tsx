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
  Sparkles,
  Loader2,
} from "lucide-react";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";

const sections = [
  {
    id: "publications",
    label: "Publications",
    description: "Partage et découvre les publications de la communauté",
    icon: <FileText className="w-6 h-6" />,
    couleur: "from-rose-500 to-pink-400",
    href: (slug: string) => `/camp/${slug}/communaute/publications`,
  },
  {
    id: "discussions",
    label: "Discussions",
    description: "Échange en temps réel avec les membres",
    icon: <MessageSquare className="w-6 h-6" />,
    couleur: "from-blue-400 to-indigo-500",
    href: (slug: string) => `/camp/${slug}/communaute/discussions`,
  },
  {
    id: "membres",
    label: "Voir les membres",
    description: "Découvre qui fait partie de la communauté",
    icon: <Users className="w-6 h-6" />,
    couleur: "from-emerald-400 to-teal-500",
    href: (slug: string) => `/camp/${slug}/communaute/membres`,
  },
  {
    id: "projets",
    label: "Créer un projet",
    description: "Lance un nouveau projet collaboratif",
    icon: <Rocket className="w-6 h-6" />,
    couleur: "from-amber-400 to-orange-500",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!communaute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg">Communauté introuvable</p>
          <Link href="/choix-communaute" className="text-rose-400 hover:underline text-sm mt-2 inline-block">
            Retour aux communautés
          </Link>
        </div>
      </div>
    );
  }

  const style = getCommunityStyle(communaute.name);
  const Icone = style.icone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => router.push("/choix-communaute")}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux communautés
        </button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.couleur} shadow-lg`}>
                <Icone className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">
                  Communauté
                </p>
                <h1 className="text-3xl font-bold text-white">{communaute.name}</h1>
              </div>
            </div>

            <p className="text-white/60 max-w-xl leading-relaxed">
              {communaute.description || style.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-5">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Users className="w-4 h-4 text-white/30" />
                {communaute.membres.toLocaleString()} membre{communaute.membres > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Link
                href={s.href(slug)}
                className="block text-left rounded-2xl p-6 border-2 border-white/10 bg-white/5 
                           hover:border-white/30 hover:bg-white/10 transition-all duration-300 
                           group hover:shadow-lg hover:shadow-rose-400/5"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${s.couleur} w-fit mb-3 
                                  group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">{s.icon}</div>
                </div>
                <p className="text-white font-medium text-lg group-hover:text-transparent 
                             group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-rose-200 
                             group-hover:bg-clip-text transition-all duration-300">
                  {s.label}
                </p>
                <p className="text-white/40 text-sm mt-1">{s.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
