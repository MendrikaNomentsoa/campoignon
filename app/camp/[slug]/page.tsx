// app/camp/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Users, BookOpen, Code2, Sparkles } from "lucide-react";

// Données des communautés (à importer ou recopier)
const communautes = {
  programmation: {
    nom: "Programmation",
    description: "Code, apprends et construis des projets avec d'autres développeurs.",
    membres: 1247,
    tags: ["Web", "Mobile", "IA", "DevOps"],
    projets: ["Site E-commerce", "Application Mobile", "API REST", "Chatbot IA"],
  },
  lecture: {
    nom: "Lecture",
    description: "Plonge dans les livres et partage tes découvertes littéraires.",
    membres: 856,
    tags: ["Romans", "Développement", "Poésie", "Essais"],
    projets: ["Club de Lecture", "Critiques Littéraires", "Atelier d'Écriture"],
  },
  sport: {
    nom: "Sport",
    description: "Repousse tes limites et atteins tes objectifs sportifs.",
    membres: 2341,
    tags: ["Running", "Musculation", "Yoga", "CrossFit"],
    projets: ["Challenge Running", "Programme Musculation", "Cours de Yoga"],
  },
};

export default function CampPage() {
  const params = useParams();
  const slug = params.slug as string;
  const communaute = communautes[slug as keyof typeof communautes];

  if (!communaute) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white">Communauté non trouvée</h1>
          <Link href="/" className="text-rose-400 hover:underline mt-4 inline-block">
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 p-8">
      <div className="container max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux communautés
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{communaute.nom}</h1>
                <p className="text-white/60">{communaute.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/40">
                <Users className="w-4 h-4" />
                <span>{communaute.membres.toLocaleString()} membres</span>
              </div>
              <div className="flex gap-2">
                {communaute.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Projets en cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communaute.projets.map((projet) => (
                <div key={projet} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-medium">{projet}</h3>
                  <p className="text-white/40 text-sm">Projet collaboratif</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}