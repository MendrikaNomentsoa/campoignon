"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Rocket,
  FileText,
  Upload,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Target,
  ArrowLeft,
  Loader2,
  Brain,
} from "lucide-react";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";
import { ProfilerPanel } from "@/components/ai/ProfilerPanel";
import { RelanceBriefing } from "@/components/ai/RelanceBriefing";
import { HeritageCardComponent } from "@/components/ai/HeritageCard";

const membresParDefaut = [
  { nom: "Marie Curie", avatar: "M", role: "Mentor" },
  { nom: "Victor Hugo", avatar: "V", role: "Membre" },
  { nom: "Alice Martin", avatar: "A", role: "Expert" },
  { nom: "Thomas Bernard", avatar: "T", role: "Membre" },
];

const publicationsParDefaut = [
  { id: 1, auteur: "Marie Curie", avatar: "M", titre: "Belle avancée aujourd'hui", contenu: "Petit à petit, ça prend forme.", date: "Il y a 1h", likes: 14, commentaires: 4 },
  { id: 2, auteur: "Victor Hugo", avatar: "V", titre: "Objectif atteint !", contenu: "3 mois de travail, mais quelle satisfaction.", date: "Il y a 5h", likes: 22, commentaires: 9 },
  { id: 3, auteur: "Alice Martin", avatar: "A", titre: "Petit rituel du soir", contenu: "20 minutes chaque jour, ça change vraiment la donne.", date: "Il y a 1 jour", likes: 31, commentaires: 6 },
];

type Section = "publier" | "membres" | "projet" | null;

export default function TableauDeBordCommunautePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [communaute, setCommunaute] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState<Section>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [titreProjet, setTitreProjet] = useState("");
  const [contenuPublication, setContenuPublication] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchCommunity(slug).then((data) => {
      setCommunaute(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
      </div>
    );
  }

  if (!communaute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Communauté introuvable</p>
      </div>
    );
  }

  const style = getCommunityStyle(communaute.name);
  const Icone = style.icone;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setPdfFile(file);
  };

  const handleCreerProjet = () => {
    router.push(`/camp/${slug}/projets`);
  };

  const handlePublier = () => {
    setContenuPublication("");
    setActiveSection(null);
  };

  const sections = [
    {
      id: "publier" as const,
      label: "Faire une publication",
      description: "Partage où tu en es",
      icon: <FileText className="w-6 h-6" />,
      couleur: "from-rose-500 to-pink-400",
    },
    {
      id: "membres" as const,
      label: "Voir les membres",
      description: `${communaute.membres.toLocaleString()} membres actifs`,
      icon: <Users className="w-6 h-6" />,
      couleur: "from-blue-400 to-indigo-500",
    },
    {
      id: "projet" as const,
      label: "Créer un projet",
      description: "Ajoute un document et commence",
      icon: <Rocket className="w-6 h-6" />,
      couleur: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.push(`/camp/${slug}`)}
          className="flex items-center gap-2 text-foreground/40 hover:text-foreground/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la communauté
        </button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 border border-foreground/10 bg-foreground/5 backdrop-blur-sm relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.couleur} shadow-lg`}>
                <Icone className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/40 mb-1">
                  Communauté
                </p>
                <h1 className="text-3xl font-bold text-foreground">{communaute.name}</h1>
              </div>
            </div>

            <p className="text-foreground/60 max-w-xl leading-relaxed">
              {communaute.description || style.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-5">
              <div className="flex items-center gap-2 text-sm text-foreground/50">
                <Users className="w-4 h-4 text-foreground/30" />
                {communaute.membres.toLocaleString()} membre{communaute.membres > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sections.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className={`text-left rounded-2xl p-5 border-2 transition-all duration-300
                ${
                  activeSection === s.id
                    ? "border-rose-400 bg-rose-400/10 shadow-lg shadow-rose-400/20"
                    : "border-foreground/10 bg-foreground/5 hover:border-foreground/30 hover:bg-foreground/10"
                }`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${s.couleur} w-fit mb-3`}>
                <div className="text-white">{s.icon}</div>
              </div>
              <p className="text-foreground font-medium">{s.label}</p>
              <p className="text-foreground/40 text-xs mt-1">{s.description}</p>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSection === "publier" && (
            <motion.div
              key="publier"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-6 border border-foreground/10 bg-foreground/5 space-y-4 overflow-hidden"
            >
              <h3 className="text-foreground font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Nouvelle publication
              </h3>
              <textarea
                value={contenuPublication}
                onChange={(e) => setContenuPublication(e.target.value)}
                placeholder="Où en es-tu aujourd'hui ?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:border-rose-400 focus:outline-none transition-colors resize-none"
              />
              <button
                onClick={handlePublier}
                disabled={!contenuPublication.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-medium text-sm disabled:opacity-40 transition-all"
              >
                Publier
              </button>
            </motion.div>
          )}

          {activeSection === "membres" && (
            <motion.div
              key="membres"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-6 border border-foreground/10 bg-foreground/5 space-y-3 overflow-hidden"
            >
              <h3 className="text-foreground font-medium flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                Membres de la communauté
              </h3>
              {membresParDefaut.map((m) => (
                <div
                  key={m.nom}
                  className="flex items-center gap-3 p-3 bg-foreground/5 rounded-xl border border-foreground/5"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.couleur} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {m.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/80 font-medium text-sm">{m.nom}</span>
                      <span className="text-foreground/20 text-[10px]">{m.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeSection === "projet" && (
            <motion.div
              key="projet"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-6 border border-foreground/10 bg-foreground/5 space-y-4 overflow-hidden"
            >
              <h3 className="text-foreground font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Nouveau projet
              </h3>

              <div>
                <label className="text-foreground/70 text-sm block mb-1">Titre du projet</label>
                <input
                  type="text"
                  value={titreProjet}
                  onChange={(e) => setTitreProjet(e.target.value)}
                  placeholder="Ex : Mon projet"
                  className="w-full px-4 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-foreground/70 text-sm block mb-1">Ajouter un document</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                    ${isDragOver
                      ? "border-amber-400 bg-amber-400/10"
                      : pdfFile
                      ? "border-emerald-400 bg-emerald-400/5"
                      : "border-foreground/10 hover:border-amber-400/50 hover:bg-foreground/5"
                    }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.epub,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-emerald-400" />
                      <p className="text-foreground text-sm">{pdfFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-foreground/30 mx-auto mb-2" />
                      <p className="text-foreground/40 text-sm">
                        Glisse ton fichier ici ou clique pour sélectionner
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreerProjet}
                disabled={!titreProjet.trim()}
                className={`px-5 py-2 rounded-xl bg-gradient-to-r ${style.couleur} text-white font-medium text-sm disabled:opacity-40 transition-all flex items-center gap-2`}
              >
                <Rocket className="w-4 h-4" />
                Lancer le projet
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 pt-4">
          <h3 className="text-foreground/50 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Outils IA
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfilerPanel communityId={slug} />
            <HeritageCardComponent challengeId="placeholder" communityId={slug} />
          </div>
          <RelanceBriefing challengeId="placeholder" communityId={slug} />
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-foreground/50 text-sm font-medium uppercase tracking-wider">
            Publications de la communauté
          </h3>
          {publicationsParDefaut.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 border border-foreground/5 bg-foreground/5 hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.couleur} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {pub.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/80 font-medium text-sm">{pub.auteur}</span>
                    <span className="text-foreground/30 text-xs">{pub.date}</span>
                  </div>
                  <h4 className="text-foreground font-medium mt-1">{pub.titre}</h4>
                  <p className="text-foreground/50 text-sm mt-1">{pub.contenu}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-foreground/30 hover:text-rose-400 transition-colors text-xs">
                      <Heart className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}
