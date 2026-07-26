"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";

const publicationsMock = [
  { id: 1, auteur: "Alice Martin", avatar: "A", titre: "Comment débuter en React ?", contenu: "Je cherche des ressources pour apprendre React. Des recommandations ?", date: "Il y a 2h", likes: 12, commentaires: 5 },
  { id: 2, auteur: "Thomas Bernard", avatar: "T", titre: "Astuce du jour : Git rebase", contenu: "Le rebase est super utile pour garder un historique propre...", date: "Il y a 4h", likes: 8, commentaires: 3 },
  { id: 3, auteur: "Sophie Dubois", avatar: "S", titre: "Mon projet final est terminé !", contenu: "Après 3 mois de travail, mon site e-commerce est en ligne !", date: "Il y a 1 jour", likes: 24, commentaires: 7 },
  { id: 4, auteur: "Marie Curie", avatar: "M", titre: "Belle avancée aujourd'hui", contenu: "Petit à petit, ça prend forme. Content de partager ça avec vous.", date: "Il y a 1 jour", likes: 14, commentaires: 4 },
  { id: 5, auteur: "Victor Hugo", avatar: "V", titre: "Objectif atteint !", contenu: "3 mois de travail, mais quelle satisfaction. Prochaine étape ?", date: "Il y a 2 jours", likes: 22, commentaires: 9 },
];

export default function PublicationsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [nouvellePublication, setNouvellePublication] = useState("");
  const [communaute, setCommunaute] = useState<CommunityData | null>(null);

  useEffect(() => {
    fetchCommunity(slug).then(setCommunaute);
  }, [slug]);

  const style = communaute ? getCommunityStyle(communaute.name) : getCommunityStyle("default");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/camp/${slug}`)}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${style.couleur}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Publications</h1>
              <p className="text-white/40 text-sm">
                {communaute?.name || "Chargement..."} · {publicationsMock.length} publications
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border border-white/10 bg-white/5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h3 className="text-white font-medium text-sm">Nouvelle publication</h3>
          </div>
          <textarea
            value={nouvellePublication}
            onChange={(e) => setNouvellePublication(e.target.value)}
            placeholder="Partage où tu en es..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white 
                       placeholder:text-white/30 focus:border-rose-400 focus:outline-none transition-colors 
                       resize-none text-sm"
          />
          <button
            disabled={!nouvellePublication.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white 
                       font-medium text-sm disabled:opacity-40 transition-all"
          >
            Publier
          </button>
        </motion.div>

        <div className="space-y-4">
          {publicationsMock.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/5 
                         hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.couleur} 
                                flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {pub.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white/80 font-medium">{pub.auteur}</span>
                      <span className="text-white/30 text-xs ml-2">{pub.date}</span>
                    </div>
                  </div>
                  <h4 className="text-white font-medium mt-1">{pub.titre}</h4>
                  <p className="text-white/50 text-sm mt-1">{pub.contenu}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-white/30 hover:text-rose-400 transition-colors text-xs">
                      <Heart className="w-4 h-4" />
                      {pub.likes}
                    </button>
                    <button className="flex items-center gap-1 text-white/30 hover:text-rose-400 transition-colors text-xs">
                      <MessageCircle className="w-4 h-4" />
                      {pub.commentaires}
                    </button>
                    <button className="flex items-center gap-1 text-white/30 hover:text-rose-400 transition-colors text-xs">
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
