"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Crown, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";

const membresMock = [
  { nom: "Alice Martin", avatar: "A", role: "Expert", actif: true, points: 2450 },
  { nom: "Thomas Bernard", avatar: "T", role: "Mentor", actif: true, points: 1890 },
  { nom: "Sophie Dubois", avatar: "S", role: "Membre", actif: false, points: 1560 },
  { nom: "Jean Dupont", avatar: "J", role: "Membre", actif: true, points: 1230 },
  { nom: "Marie Curie", avatar: "M", role: "Mentor", actif: true, points: 980 },
  { nom: "Victor Hugo", avatar: "V", role: "Membre", actif: false, points: 750 },
  { nom: "Lucas Durand", avatar: "L", role: "Membre", actif: true, points: 620 },
  { nom: "Emma Petit", avatar: "E", role: "Membre", actif: false, points: 430 },
];

export default function MembresPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [search, setSearch] = useState("");
  const [communaute, setCommunaute] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunity(slug).then((data) => {
      setCommunaute(data);
      setLoading(false);
    });
  }, [slug]);

  const style = communaute ? getCommunityStyle(communaute.name) : getCommunityStyle("default");

  const filtered = membresMock.filter((m) =>
    m.nom.toLowerCase().includes(search.toLowerCase())
  );

  const enLigne = filtered.filter((m) => m.actif);
  const horsLigne = filtered.filter((m) => !m.actif);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/camp/${slug}`)}
            className="flex items-center gap-2 text-foreground/40 hover:text-foreground/70 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${style.couleur}`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Membres</h1>
              <p className="text-foreground/40 text-sm">
                {communaute?.name || "Chargement..."} · {membresMock.length} membres
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-foreground/10
                       text-foreground placeholder:text-foreground/30 focus:border-emerald-400 focus:outline-none
                       transition-colors text-sm"
          />
        </motion.div>

        {enLigne.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-foreground/50 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              En ligne ({enLigne.length})
            </h3>
            <div className="space-y-2">
              {enLigne.map((membre, index) => (
                <motion.div
                  key={membre.nom}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-foreground/5
                             hover:border-foreground/20 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.couleur}
                                  flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {membre.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/80 font-medium text-sm">{membre.nom}</span>
                      {membre.role === "Expert" && <Crown className="w-3 h-3 text-amber-400" />}
                      {membre.role === "Mentor" && <Crown className="w-3 h-3 text-blue-400" />}
                      <span className="text-foreground/20 text-[10px]">{membre.role}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-foreground/20 text-[10px]">En ligne</span>
                    </div>
                  </div>
                  <div className="text-foreground/30 text-xs shrink-0">
                    {membre.points} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {horsLigne.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-foreground/50 text-sm font-medium uppercase tracking-wider">
              Hors ligne ({horsLigne.length})
            </h3>
            <div className="space-y-2">
              {horsLigne.map((membre, index) => (
                <motion.div
                  key={membre.nom}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5 border border-foreground/5
                             hover:border-foreground/20 transition-all duration-300 opacity-60"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10
                                  flex items-center justify-center text-foreground/50 font-bold text-sm shrink-0">
                    {membre.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/60 font-medium text-sm">{membre.nom}</span>
                      <span className="text-foreground/20 text-[10px]">{membre.role}</span>
                    </div>
                  </div>
                  <div className="text-foreground/20 text-xs shrink-0">
                    {membre.points} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/40 text-sm">Aucun membre trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
