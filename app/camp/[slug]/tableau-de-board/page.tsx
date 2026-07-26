"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Code2,
  Dumbbell,
  Palette,
  Music2,
  Briefcase,
  Users,
  Rocket,
  FileText,
  Upload,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Target,
  Crown,
  ArrowLeft,
} from "lucide-react";

// --- Données par communauté ---
const communautesData: Record
  string,
  {
    nom: string;
    but: string;
    membres: number;
    projetsEnCours: number;
    publications: number;
    icone: React.ReactNode;
    couleur: string;
    gradient: string;
  }
> = {
  programmation: {
    nom: "Programmation",
    but: "Aucun projet de code ne doit finir oublié dans un dossier fermé. Ici, on avance ensemble, on partage nos blocages, et on transforme l'élan en projet terminé.",
    membres: 1247,
    projetsEnCours: 89,
    publications: 234,
    icone: <Code2 className="w-8 h-8" />,
    couleur: "from-purple-500 to-pink-500",
    gradient: "from-purple-500/10 to-pink-500/10",
  },
  lecture: {
    nom: "Lecture",
    but: "Aucun livre commencé ne doit finir oublié dans un coin. Ici, on lit ensemble, on se motive, et on partage ce qu'on découvre — un chapitre à la fois.",
    membres: 856,
    projetsEnCours: 47,
    publications: 156,
    icone: <BookOpen className="w-8 h-8" />,
    couleur: "from-amber-400 to-orange-500",
    gradient: "from-amber-400/10 to-orange-500/10",
  },
  sport: {
    nom: "Sport",
    but: "Repousse tes limites avec d'autres qui visent les mêmes objectifs. On se motive, on partage nos progrès, et on ne lâche pas au premier jour difficile.",
    membres: 2341,
    projetsEnCours: 132,
    publications: 312,
    icone: <Dumbbell className="w-8 h-8" />,
    couleur: "from-emerald-400 to-teal-500",
    gradient: "from-emerald-400/10 to-teal-500/10",
  },
  dessin: {
    nom: "Dessin",
    but: "Donne vie à ton imaginaire, entouré d'autres artistes. Partage tes créations, tes techniques, et avance sur tes projets sans jamais rester bloqué seul.",
    membres: 623,
    projetsEnCours: 41,
    publications: 89,
    icone: <Palette className="w-8 h-8" />,
    couleur: "from-rose-400 to-red-500",
    gradient: "from-rose-400/10 to-red-500/10",
  },
  musique: {
    nom: "Musique",
    but: "Crée, compose et progresse avec d'autres musiciens. Partage tes morceaux, tes techniques, et avance sur tes projets sans jamais rester bloqué seul.",
    membres: 934,
    projetsEnCours: 58,
    publications: 178,
    icone: <Music2 className="w-8 h-8" />,
    couleur: "from-blue-400 to-indigo-500",
    gradient: "from-blue-400/10 to-indigo-500/10",
  },
  entrepreneuriat: {
    nom: "Entrepreneuriat",
    but: "Construis ton projet de l'idée au lancement, entouré d'autres porteurs de projet. On avance ensemble, étape par étape, jusqu'au bout.",
    membres: 1578,
    projetsEnCours: 95,
    publications: 245,
    icone: <Briefcase className="w-8 h-8" />,
    couleur: "from-yellow-400 to-orange-400",
    gradient: "from-yellow-400/10 to-orange-400/10",
  },
};

// --- Données mock (à remplacer plus tard par les vraies routes API) ---
const membresParDefaut = [
  { nom: "Marie Curie", avatar: "M", role: "Mentor" },
  { nom: "Victor Hugo", avatar: "V", role: "Membre" },
  { nom: "Alice Martin", avatar: "A", role: "Expert" },
  { nom: "Thomas Bernard", avatar: "T", role: "Membre" },
];

const publicationsParDefaut = [
  {
    id: 1,
    auteur: "Marie Curie",
    avatar: "M",
    titre: "Belle avancée aujourd'hui",
    contenu: "Petit à petit, ça prend forme. Content de partager ça avec vous.",
    date: "Il y a 1h",
    likes: 14,
    commentaires: 4,
  },
  {
    id: 2,
    auteur: "Victor Hugo",
    avatar: "V",
    titre: "Objectif atteint !",
    contenu: "3 mois de travail, mais quelle satisfaction. Prochaine étape ?",
    date: "Il y a 5h",
    likes: 22,
    commentaires: 9,
  },
  {
    id: 3,
    auteur: "Alice Martin",
    avatar: "A",
    titre: "Petit rituel du soir",
    contenu: "20 minutes chaque jour, ça change vraiment la donne pour tenir.",
    date: "Il y a 1 jour",
    likes: 31,
    commentaires: 6,
  },
];

type Section = "publier" | "membres" | "projet" | null;

export default function TableauDeBordCommunautePage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const communaute = communautesData[slug] ?? communautesData.programmation;

  const [activeSection, setActiveSection] = useState<Section>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [titreProjet, setTitreProjet] = useState("");
  const [contenuPublication, setContenuPublication] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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
    // TODO: brancher sur POST /api/challenges avec le community_id correspondant à `slug`
    router.push("/profil");
  };

  const handlePublier = () => {
    // TODO: brancher sur POST /api/entries avec le community_id correspondant à `slug`
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-rose-900/80 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux communautés
        </button>

        {/* Debrief de la communauté */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${communaute.gradient}`} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${communaute.couleur} shadow-lg`}>
                <div className="text-white">{communaute.icone}</div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">
                  Communauté
                </p>
                <h1 className="text-3xl font-bold text-white">{communaute.nom}</h1>
              </div>
            </div>

            <p className="text-white/60 max-w-xl leading-relaxed">{communaute.but}</p>

            <div className="flex flex-wrap items-center gap-6 mt-5">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Users className="w-4 h-4 text-white/30" />
                {communaute.membres.toLocaleString()} membres
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Rocket className="w-4 h-4 text-white/30" />
                {communaute.projetsEnCours} projets en cours
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <FileText className="w-4 h-4 text-white/30" />
                {communaute.publications} publications
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trois sections */}
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
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${s.couleur} w-fit mb-3`}>
                <div className="text-white">{s.icon}</div>
              </div>
              <p className="text-white font-medium">{s.label}</p>
              <p className="text-white/40 text-xs mt-1">{s.description}</p>
            </motion.button>
          ))}
        </div>

        {/* Contenu de la section active */}
        <AnimatePresence mode="wait">
          {activeSection === "publier" && (
            <motion.div
              key="publier"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-6 border border-white/10 bg-white/5 space-y-4 overflow-hidden"
            >
              <h3 className="text-white font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Nouvelle publication
              </h3>
              <textarea
                value={contenuPublication}
                onChange={(e) => setContenuPublication(e.target.value)}
                placeholder="Où en es-tu aujourd'hui ?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-rose-400 focus:outline-none transition-colors resize-none"
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
              className="rounded-2xl p-6 border border-white/10 bg-white/5 space-y-3 overflow-hidden"
            >
              <h3 className="text-white font-medium flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                Membres de la communauté
              </h3>
              {membresParDefaut.map((m) => (
                <div
                  key={m.nom}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${communaute.couleur} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {m.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-medium text-sm">{m.nom}</span>
                      {m.role === "Mentor" && <Crown className="w-3 h-3 text-amber-400" />}
                      <span className="text-white/20 text-[10px]">{m.role}</span>
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
              className="rounded-2xl p-6 border border-white/10 bg-white/5 space-y-4 overflow-hidden"
            >
              <h3 className="text-white font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Nouveau projet
              </h3>

              <div>
                <label className="text-white/70 text-sm block mb-1">Titre du projet</label>
                <input
                  type="text"
                  value={titreProjet}
                  onChange={(e) => setTitreProjet(e.target.value)}
                  placeholder="Ex : Mon projet"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm block mb-1">Ajouter un document</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                    ${
                      isDragOver
                        ? "border-amber-400 bg-amber-400/10"
                        : pdfFile
                        ? "border-emerald-400 bg-emerald-400/5"
                        : "border-white/10 hover:border-amber-400/50 hover:bg-white/5"
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
                      <p className="text-white text-sm">{pdfFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-white/30 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">
                        Glisse ton fichier ici ou clique pour sélectionner
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleCreerProjet}
                disabled={!titreProjet.trim()}
                className={`px-5 py-2 rounded-xl bg-gradient-to-r ${communaute.couleur} text-white font-medium text-sm disabled:opacity-40 transition-all flex items-center gap-2`}
              >
                <Rocket className="w-4 h-4" />
                Lancer le projet
              </button>
              <p className="text-white/30 text-xs">
                Tu seras redirigé vers ton profil après la création.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Publications des autres membres */}
        <div className="space-y-4 pt-4">
          <h3 className="text-white/50 text-sm font-medium uppercase tracking-wider">
            Publications de la communauté
          </h3>
          {publicationsParDefaut.map((pub, index) => (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 border border-white/5 bg-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${communaute.couleur} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {pub.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 font-medium text-sm">{pub.auteur}</span>
                    <span className="text-white/30 text-xs">{pub.date}</span>
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