"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  UserPlus,
  Sparkles,
  Crown,
  Star,
  Heart,
  Share2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Brain,
  Trophy,
} from "lucide-react";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";
import { MediatorPanel } from "@/components/ai/MediatorPanel";
import { ChallengesPanel } from "@/components/challenges/ChallengesPanel";

const stats = [
  { label: "Membres", value: 0, icon: <Users className="w-5 h-5" />, color: "bg-blue-500/20" },
  { label: "Publications", value: 0, icon: <FileText className="w-5 h-5" />, color: "bg-emerald-400/20" },
  { label: "Discussions", value: 0, icon: <MessageSquare className="w-5 h-5" />, color: "bg-amber-400/20" },
];

const publicationsRecentes = [
  { id: 1, auteur: "Alice Martin", avatar: "A", titre: "Comment débuter en React ?", contenu: "Je cherche des ressources pour apprendre React.", date: "Il y a 2h", likes: 12, commentaires: 5 },
  { id: 2, auteur: "Thomas Bernard", avatar: "T", titre: "Astuce du jour : Git rebase", contenu: "Le rebase est super utile pour garder un historique propre...", date: "Il y a 4h", likes: 8, commentaires: 3 },
  { id: 3, auteur: "Sophie Dubois", avatar: "S", titre: "Mon projet final est terminé !", contenu: "Après 3 mois de travail, mon site e-commerce est en ligne !", date: "Il y a 1 jour", likes: 24, commentaires: 7 },
];

const membresEnLigne = [
  { nom: "Jean Dupont", avatar: "J", role: "Expert" },
  { nom: "Marie Curie", avatar: "M", role: "Mentor" },
  { nom: "Victor Hugo", avatar: "V", role: "Membre" },
  { nom: "Lucas Durand", avatar: "L", role: "Membre" },
];

const topContributeurs = [
  { nom: "Alice Martin", avatar: "A", points: 2450, role: "Expert" },
  { nom: "Thomas Bernard", avatar: "T", points: 1890, role: "Mentor" },
  { nom: "Sophie Dubois", avatar: "S", points: 1560, role: "Membre" },
  { nom: "Jean Dupont", avatar: "J", points: 1230, role: "Membre" },
];

export default function CommunautePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "publications");
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
      </div>
    );
  }

  if (!communaute) {
    return (
      <div className="text-center py-20">
        <p className="text-foreground/60">Communauté introuvable</p>
      </div>
    );
  }

  const style = getCommunityStyle(communaute.name);
  const Icone = style.icone;

  const statsValues = [
    { label: "Membres", value: communaute.membres, icon: <Users className="w-5 h-5" />, color: "bg-blue-500/20" },
    { label: "Publications", value: 234, icon: <FileText className="w-5 h-5" />, color: "bg-emerald-400/20" },
    { label: "Discussions", value: 89, icon: <MessageSquare className="w-5 h-5" />, color: "bg-amber-400/20" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-linear-to-br ${style.couleur} shadow-lg`}>
            <Icone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Communauté</h1>
            <p className="text-foreground/40 text-sm">
              {communaute.name} · {communaute.membres} membre{communaute.membres > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/camp/${slug}/communaute/membres`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10
                       text-foreground/60 hover:text-foreground/90 transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Voir les membres
          </Link>
          <Link
            href={`/camp/${slug}/communaute/publications`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-linear-to-r from-burgundy-500 to-rose-400 
                       text-white font-medium hover:opacity-90 transition-all duration-300 
                       shadow-lg shadow-rose-400/20 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Nouvelle publication
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {statsValues.map((stat, index) => (
          <div
            key={index}
            className="bg-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-foreground/5
                       hover:border-foreground/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-foreground/40 text-xs">{stat.label}</p>
                <p className="text-foreground font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1 p-1 bg-foreground/5 rounded-xl border border-foreground/5 w-full md:w-auto overflow-x-auto"
      >
        {[
          { id: "publications", label: "Publications", icon: <FileText className="w-4 h-4" /> },
          { id: "discussions", label: "Discussions", icon: <MessageSquare className="w-4 h-4" /> },
          { id: "defis", label: "Défis", icon: <Trophy className="w-4 h-4" /> },
          { id: "membres", label: "Membres", icon: <Users className="w-4 h-4" /> },
          { id: "classement", label: "Classement", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "assistant", label: "Assistant IA", icon: <Brain className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                       transition-all duration-300 whitespace-nowrap
                       ${
                         activeTab === tab.id
                           ? "bg-rose-400/20 text-rose-300 border border-rose-400/30"
                           : "text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5"
                       }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "publications" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {publicationsRecentes.map((pub, index) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-foreground/5
                             hover:border-foreground/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${style.couleur}
                                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {pub.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-foreground/80 font-medium">{pub.auteur}</span>
                          <span className="text-foreground/30 text-xs ml-2">{pub.date}</span>
                        </div>
                      </div>
                      <h4 className="text-foreground font-medium mt-1">{pub.titre}</h4>
                      <p className="text-foreground/50 text-sm mt-1">{pub.contenu}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-foreground/30 hover:text-rose-400 transition-colors text-xs">
                          <ThumbsUp className="w-4 h-4" />
                          {pub.likes}
                        </button>
                        <button className="flex items-center gap-1 text-foreground/30 hover:text-rose-400 transition-colors text-xs">
                          <MessageCircle className="w-4 h-4" />
                          {pub.commentaires}
                        </button>
                        <button className="flex items-center gap-1 text-foreground/30 hover:text-rose-400 transition-colors text-xs">
                          <Share2 className="w-4 h-4" />
                          Partager
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Link
                href={`/camp/${slug}/communaute/publications`}
                className="block text-center text-foreground/30 hover:text-foreground/60 text-sm py-2 transition-colors"
              >
                Voir toutes les publications →
              </Link>
            </motion.div>
          )}

          {activeTab === "discussions" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-foreground/5
                            hover:border-foreground/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500
                                flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    M
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground/80 font-medium">Marie Curie</span>
                      <span className="text-foreground/30 text-xs">Il y a 3h</span>
                    </div>
                    <h4 className="text-foreground font-medium mt-1">Quel est votre livre préféré ?</h4>
                    <p className="text-foreground/50 text-sm mt-1">Je cherche des recommandations de lecture...</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-foreground/30 text-xs">
                        <MessageCircle className="w-4 h-4" />
                        12 réponses
                      </span>
                      <span className="flex items-center gap-1 text-foreground/30 text-xs">
                        <Eye className="w-4 h-4" />
                        45 vues
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/camp/${slug}/communaute/discussions`}
                className="block text-center text-foreground/30 hover:text-foreground/60 text-sm py-2 transition-colors"
              >
                Voir toutes les discussions →
              </Link>
            </motion.div>
          )}

          {activeTab === "defis" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ChallengesPanel communityId={communaute.id} />
            </motion.div>
          )}

          {activeTab === "membres" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {membresEnLigne.map((membre, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl border border-foreground/5
                             hover:border-foreground/20 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${style.couleur}
                                flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {membre.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/80 font-medium">{membre.nom}</span>
                      <span className="text-foreground/20 text-[10px]">{membre.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Link
                href={`/camp/${slug}/communaute/membres`}
                className="block text-center text-foreground/30 hover:text-foreground/60 text-sm py-2 transition-colors"
              >
                Voir tous les membres →
              </Link>
            </motion.div>
          )}

          {activeTab === "classement" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {topContributeurs.map((membre, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl border border-foreground/5
                             hover:border-foreground/20 transition-all duration-300"
                >
                  <div className="text-foreground/30 text-sm font-bold w-6 text-center">
                    {index + 1}
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-linear-to-br ${style.couleur}
                                flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {membre.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/80 font-medium">{membre.nom}</span>
                      <span className="text-foreground/20 text-[10px]">{membre.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400/60" />
                    <span className="text-foreground/40 text-sm font-medium">{membre.points}</span>
                  </div>
                </motion.div>
              ))}

              <Link
                href={`/camp/${slug}/communaute/classement`}
                className="block text-center text-foreground/30 hover:text-foreground/60 text-sm py-2 transition-colors"
              >
                Voir le classement complet →
              </Link>
            </motion.div>
          )}

          {activeTab === "assistant" && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <MediatorPanel communityId={slug} />
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-foreground/5"
          >
            <h3 className="text-foreground/60 text-sm font-medium mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Membres en ligne
            </h3>

            <div className="space-y-2">
              {membresEnLigne.map((membre, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-foreground/5 rounded-lg">
                  <div className={`w-8 h-8 rounded-full bg-linear-to-br ${style.couleur}
                                flex items-center justify-center text-white font-bold text-xs`}>
                    {membre.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground/70 text-sm">{membre.nom}</p>
                    <p className="text-foreground/20 text-[10px]">{membre.role}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-foreground/5"
          >
            <h3 className="text-foreground/60 text-sm font-medium mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Top contributeurs
            </h3>

            <div className="space-y-2">
              {topContributeurs.map((membre, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-foreground/5 rounded-lg">
                  <div className="text-foreground/30 text-xs font-bold w-4">
                    {index + 1}
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-linear-to-br ${style.couleur}
                                flex items-center justify-center text-white font-bold text-xs`}>
                    {membre.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground/70 text-sm">{membre.nom}</p>
                    <p className="text-foreground/20 text-[10px]">{membre.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400/60" />
                    <span className="text-foreground/30 text-xs">{membre.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-foreground/5 backdrop-blur-sm rounded-xl p-5 border border-foreground/5"
          >
            <h3 className="text-foreground/60 text-sm font-medium mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Règles de la communauté
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-foreground/40">
                <span className="text-rose-400/60">•</span>
                Respecte les autres membres
              </li>
              <li className="flex items-start gap-2 text-foreground/40">
                <span className="text-rose-400/60">•</span>
                Partage tes connaissances
              </li>
              <li className="flex items-start gap-2 text-foreground/40">
                <span className="text-rose-400/60">•</span>
                Reste dans le sujet de la communauté
              </li>
              <li className="flex items-start gap-2 text-foreground/40">
                <span className="text-rose-400/60">•</span>
                Pas de spam ou de publicité
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
