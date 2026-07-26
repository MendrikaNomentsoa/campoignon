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
  Loader2,
} from "lucide-react";
import { BarreNavigation } from "@/components/navigation/BarreNavigation";
import { PiedPage } from "@/components/navigation/PiedPage";

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

const PALETTE: CommunauteStyle[] = [
  { icone: <Code2 className="size-8" />, couleur: "from-[#a92940] to-[#d8699e]", gradient: "from-[#a92940]/20 to-[#d8699e]/20" },
  { icone: <BookOpen className="size-8" />, couleur: "from-[#62121b] to-[#a92940]", gradient: "from-[#62121b]/20 to-[#a92940]/20" },
  { icone: <Dumbbell className="size-8" />, couleur: "from-[#d8699e] to-[#a92940]", gradient: "from-[#d8699e]/20 to-[#a92940]/20" },
  { icone: <Palette className="size-8" />, couleur: "from-[#a92940] to-[#62121b]", gradient: "from-[#a92940]/20 to-[#62121b]/20" },
  { icone: <Music className="size-8" />, couleur: "from-[#62121b] to-[#d8699e]", gradient: "from-[#62121b]/20 to-[#d8699e]/20" },
  { icone: <Rocket className="size-8" />, couleur: "from-[#d8699e] to-[#62121b]", gradient: "from-[#d8699e]/20 to-[#62121b]/20" },
];

function styleForIndex(index: number): CommunauteStyle {
  return PALETTE[index % PALETTE.length];
}

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
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.12 }}
    whileHover={{ y: -2 }}
    onClick={() => onSelect(communaute.id)}
    className="group cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#a92940]/20 hover:bg-white/[0.04]"
  >
    <div className="flex items-center gap-5">
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${style.couleur} shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        <div className="text-white">{style.icone}</div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-white group-hover:text-[#f6dce9] transition-colors">
          {communaute.nom}
        </h3>
        <p className="mt-0.5 text-sm text-white/35 group-hover:text-white/50 transition-colors truncate">
          {communaute.description || "Rejoins cette communauté et lance-toi."}
        </p>
        <span className="mt-1 inline-block text-xs text-white/20">
          {communaute.membres.toLocaleString()} membre
          {communaute.membres > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  </motion.div>
);

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
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: 0.6 + index * 0.04 }}
    whileHover={{ y: -2 }}
    onClick={() => onSelect(communaute.id)}
    className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center transition-all duration-300 hover:border-[#a92940]/20 hover:bg-white/[0.04]"
  >
    <div
      className={`mx-auto mb-2.5 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.couleur} transition-transform duration-300 group-hover:scale-110`}
    >
      <div className="text-white">{style.icone}</div>
    </div>
    <p className="text-sm font-medium text-white/60 group-hover:text-white transition-colors truncate">
      {communaute.nom}
    </p>
  </motion.div>
);

export default function ChoixCommunautePage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<{ nom: string; email: string } | null>(null);
  const [communautes, setCommunautes] = useState<Communaute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user: me } = await res.json();
          setIsConnected(true);
          setUser({ nom: me.username, email: me.email });
        }
      } catch {}
    })();
  }, []);

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

  const handleSelectCommunaute = async (id: string) => {
    if (!isConnected) {
      router.push("/connexion");
      return;
    }
    setJoiningId(id);
    try {
      await fetch(`/api/communities/${id}/join`, { method: "POST" });
    } catch {}
    finally {
      setJoiningId(null);
    }
    localStorage.setItem("campoignon_communaute", id);
    router.push(`/camp/${id}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsConnected(false);
    setUser(null);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0c0204]">
      <BarreNavigation />

      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(169,41,64,0.08)_0%,transparent_50%)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-12">
          {/* Header bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#a92940] to-[#d8699e]">
                <span className="text-sm font-bold text-white">C</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Campoignon</p>
                <p className="text-xs text-white/35">
                  {isConnected
                    ? `Bienvenue ${user?.nom}`
                    : "Choisis ta communauté"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#a92940]/10 border border-[#a92940]/20 px-3 py-1.5">
                    <CheckCircle className="size-3.5 text-[#d8699e]" />
                    <span className="text-xs text-white/50">Connecté</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                  >
                    <LogOut className="size-3.5" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  <User className="size-3.5" />
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a92940]/20 bg-[#a92940]/10 px-4 py-1.5">
              <div className="size-1.5 rounded-full bg-[#d8699e] animate-pulse" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Commence l&apos;aventure
              </span>
              <Sparkles className="size-3.5 text-[#d8699e]" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Choisis ton{" "}
              <span className="bg-gradient-to-r from-[#d8699e] to-[#f6dce9] bg-clip-text text-transparent">
                Camp
              </span>
            </h1>
            <p className="mt-2 text-sm text-white/35">
              {isConnected
                ? "Rejoins une communauté pour démarrer"
                : "Connecte-toi pour rejoindre une communauté"}
            </p>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-white/30">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Chargement des communautés...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#d8699e]">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && communautes.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-white/30">
                Aucune communauté disponible pour le moment.
              </p>
            </div>
          )}

          {/* Communities */}
          {!loading && !error && communautes.length > 0 && (
            <>
              {suggerees.length > 0 && (
                <div className="space-y-3">
                  <p className="px-1 text-xs font-semibold uppercase tracking-widest text-white/25">
                    Suggérées
                  </p>
                  <div className="space-y-3">
                    {suggerees.map((c, i) => (
                      <CarteCommunaute
                        key={c.id}
                        communaute={c}
                        style={styleForIndex(i)}
                        onSelect={handleSelectCommunaute}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {autres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10"
                >
                  <p className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-white/25">
                    Autres communautés
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {autres.map((c, i) => (
                      <CarteAutreCommunaute
                        key={c.id}
                        communaute={c}
                        style={styleForIndex(i + suggerees.length)}
                        onSelect={handleSelectCommunaute}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {joiningId && (
            <p className="mt-6 text-center text-xs text-white/20">
              Connexion à la communauté...
            </p>
          )}
        </div>
      </div>

      <PiedPage />
    </div>
  );
}
