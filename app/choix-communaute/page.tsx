"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Code2,
  BookOpen,
  Dumbbell,
  Palette,
  Music,
  Rocket,
  Users,
  Sparkles,
  LogOut,
  User,
  CheckCircle,
} from "lucide-react";

// Types
interface Communaute {
  id: string;
  nom: string;
  description: string | null;
  membres: number;
}

interface CommunauteStyle {
  icone: React.ReactNode;
  couleur: string;
  gradient: string;
}

// Palette visuelle réutilisée pour chaque communauté (les vraies données Supabase
// n'ont ni icône ni couleur, on assigne un style en tournant sur cette palette)
const PALETTE: CommunauteStyle[] = [
  {
    icone: <Code2 className="w-12 h-12" />,
    couleur: "from-purple-500 to-pink-500",
    gradient: "from-purple-600/30 to-pink-600/30",
  },
  {
    icone: <BookOpen className="w-12 h-12" />,
    couleur: "from-amber-400 to-orange-500",
    gradient: "from-amber-400/30 to-orange-500/30",
  },
  {
    icone: <Dumbbell className="w-12 h-12" />,
    couleur: "from-emerald-400 to-teal-500",
    gradient: "from-emerald-400/30 to-teal-500/30",
  },
  {
    icone: <Palette className="w-12 h-12" />,
    couleur: "from-rose-400 to-red-500",
    gradient: "from-rose-400/30 to-red-500/30",
  },
  {
    icone: <Music className="w-12 h-12" />,
    couleur: "from-blue-400 to-indigo-500",
    gradient: "from-blue-400/30 to-indigo-500/30",
  },
  {
    icone: <Rocket className="w-12 h-12" />,
    couleur: "from-yellow-400 to-orange-400",
    gradient: "from-yellow-400/30 to-orange-400/30",
  },
];

function styleForIndex(index: number): CommunauteStyle {
  return PALETTE[index % PALETTE.length];
}

// Composant Carte de communauté (grande, pour les 2 premières)
const CarteCommunaute = ({
  communaute,
  style,
  onSelect,
  index,
}: {
  communaute: Communaute;
  style: CommunauteStyle;
  onSelect: (id: string) => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ scale: 1.02, y: -3 }}
      onClick={() => onSelect(communaute.id)}
      className="group relative cursor-pointer rounded-2xl p-6 border-2 border-white/10 bg-white/5 
                 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
    >
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.gradient} opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10 flex items-center gap-6">
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${style.couleur} 
                      shadow-lg transform group-hover:scale-110 transition-all duration-300`}
        >
          <div className="text-white">{style.icone}</div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-transparent 
                       group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-rose-200 
                       group-hover:bg-clip-text transition-all duration-300">
            {communaute.nom}
          </h3>
          <p className="text-white/50 text-sm mt-1 group-hover:text-white/70 transition-colors">
            {communaute.description || "Rejoins cette communauté et lance-toi."}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/30">
              {communaute.membres.toLocaleString()} membre{communaute.membres > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Carte "Autre communauté" (petite, pour le reste)
const CarteAutreCommunaute = ({
  communaute,
  style,
  onSelect,
  index,
}: {
  communaute: Communaute;
  style: CommunauteStyle;
  onSelect: (id: string) => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.05 }}
      whileHover={{ scale: 1.05, y: -3 }}
      onClick={() => onSelect(communaute.id)}
      className="group cursor-pointer rounded-xl p-4 border border-white/5 bg-white/5 
                 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-center"
    >
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${style.couleur} 
                    w-fit mx-auto mb-2 group-hover:scale-110 transition-all duration-300`}
      >
        <div className="text-white text-2xl">{style.icone}</div>
      </div>
      <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
        {communaute.nom}
      </p>
    </motion.div>
  );
};

// Composant Header
const Header = ({
  isConnected,
  user,
  onLogout,
}: {
  isConnected: boolean;
  user: { nom: string; email: string } | null;
  onLogout: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8 p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <div>
          <p className="text-white font-medium">Campoignon</p>
          <p className="text-white/40 text-sm">
            {isConnected ? `Bienvenue ${user?.nom}` : "Choisis ta communauté"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-400/10 border border-rose-400/20">
              <CheckCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-white/70">Connecté</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 
                         text-white/60 hover:text-white/90 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Déconnexion</span>
            </button>
          </>
        ) : (
          <Link
            href="/connexion"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 
                       text-white/60 hover:text-white/90 transition-all duration-300"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Connexion</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// Page principale
export default function Home() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<{ nom: string; email: string } | null>(null);
  const [communautes, setCommunautes] = useState<Communaute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user: me } = await res.json();
          setIsConnected(true);
          setUser({ nom: me.username, email: me.email });
        } else {
          setIsConnected(false);
          setUser(null);
        }
      } catch {
        setIsConnected(false);
        setUser(null);
      }
    })();
  }, []);

  // Charger les vraies communautés depuis Supabase
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/communities");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Impossible de charger les communautés");
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setCommunautes(
          list.map((c: any) => ({
            id: c.id,
            nom: c.name,
            description: c.description,
            membres: c.community_members?.length ?? 0,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const suggerees = communautes.slice(0, 2);
  const autres = communautes.slice(2);

  // Sélectionner une communauté -> rejoint (si connecté) et va direct sur ses discussions
  const handleSelectCommunaute = async (id: string) => {
    if (!isConnected) {
      router.push("/connexion");
      return;
    }

    setJoiningId(id);
    try {
      await fetch(`/api/communities/${id}/join`, { method: "POST" });
    } catch {
      // si le join échoue on tente quand même la redirection,
      // la page de discussions affichera l'erreur d'accès le cas échéant
    } finally {
      setJoiningId(null);
    }

    localStorage.setItem("campoignon_communaute", id);
    router.push(`/camp/${id}`);
  };

  // Déconnexion
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setIsConnected(false);
    setUser(null);
    localStorage.removeItem("campoignon_user");
    localStorage.removeItem("campoignon_communaute");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 relative overflow-hidden">
      {/* Effets de fond */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,69,69,0.15)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,42,42,0.1)_0%,transparent_50%)]" />

      {/* Cercle lumineux */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.3 }}
        animate={{ scale: 1.5, opacity: 0.08 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   w-[700px] h-[700px] rounded-full bg-gradient-to-r from-rose-400/10 via-rose-300/10 to-pink-200/10 
                   blur-3xl"
      />

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Header isConnected={isConnected} user={user} onLogout={handleLogout} />

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-block mb-4">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/20 to-rose-300/20 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-white/70 text-xs font-medium tracking-wider uppercase">
                  Commence l&apos;aventure
                </span>
                <Sparkles className="w-4 h-4 text-rose-300" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Bienvenue dans ton{" "}
            <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-pink-200 bg-clip-text text-transparent">
              Camp
            </span>
          </h1>

          <p className="text-white/40 mt-2 text-sm">
            {isConnected
              ? "Choisis une communauté pour rejoindre sa discussion"
              : "Connecte-toi ou inscris-toi pour rejoindre une communauté"}
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-white/40 py-12">
            <Users className="w-5 h-5 animate-pulse" />
            <span className="text-sm">Chargement des communautés...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-rose-300 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && communautes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">
              Aucune communauté disponible pour le moment.
            </p>
          </div>
        )}

        {!loading && !error && communautes.length > 0 && (
          <>
            {/* Communautés suggérées */}
            {suggerees.length > 0 && (
              <div className="space-y-4">
                <p className="text-white/30 text-sm font-medium uppercase tracking-wider px-1">
                  Communautés suggérées
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {suggerees.map((communaute, index) => (
                    <CarteCommunaute
                      key={communaute.id}
                      communaute={communaute}
                      style={styleForIndex(index)}
                      onSelect={handleSelectCommunaute}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Autres communautés */}
            {autres.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <p className="text-white/30 text-sm font-medium uppercase tracking-wider px-1 mb-4">
                  Autres communautés
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {autres.map((communaute, index) => (
                    <CarteAutreCommunaute
                      key={communaute.id}
                      communaute={communaute}
                      style={styleForIndex(index + suggerees.length)}
                      onSelect={handleSelectCommunaute}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {joiningId && (
          <p className="text-center text-white/30 text-xs mt-6">
            Connexion à la communauté...
          </p>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-white/10 text-xs">
            ✦ Choisis ta communauté et commence ton premier projet ✦
          </p>
        </motion.div>
      </div>
    </div>
  );
}