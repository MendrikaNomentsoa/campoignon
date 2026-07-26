"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Archive,
  X,
  Calendar,
  Check,
  ChevronRight,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Target,
  Loader2,
  Wand2,
  BookOpen,
  PenLine,
} from "lucide-react";

type TabId = "roadmap" | "pitch" | "readme" | "resources" | "heritage";

interface Project {
  id: string;
  title: string;
  description: string | null;
  resources: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  community_id: string | null;
  challenge_id: string | null;
}

const TAB_LABELS: Record<TabId, { label: string; icon: React.ElementType }> = {
  roadmap: { label: "Roadmap", icon: Calendar },
  pitch: { label: "Pitch", icon: PenLine },
  readme: { label: "README", icon: BookOpen },
  resources: { label: "Ressources", icon: LinkIcon },
  heritage: { label: "Héritage", icon: Archive },
};

const GENERATING_MESSAGES = [
  "Le Compagnon prépare ta roadmap...",
  "Il réfléchit aux meilleures étapes...",
  "Il génère ton pitch...",
  "Il compile les ressources...",
  "Plus que quelques secondes...",
];

function parseAiData(description: string | null): any {
  if (!description) return null;
  const markers = ["__AI_INIT__", "__AI_PITCH__", "__AI_README__", "__AI_RESOURCES__"];
  const hasMarker = markers.some((m) => description.includes(m));
  if (!hasMarker) return null;

  const result: any = {};

  const extractBlock = (marker: string): any => {
    const idx = description.indexOf(marker);
    if (idx === -1) return null;
    const start = idx + marker.length;
    const endIdx = description.indexOf(marker, start);
    if (endIdx === -1) return null;
    const raw = description.substring(start, endIdx).trim();
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  const init = extractBlock("__AI_INIT__");
  if (init && typeof init === "object") {
    if (init.roadmap) result.roadmap = init.roadmap;
    if (init.techSpecs) result.techSpecs = init.techSpecs;
    if (init.quickWin) result.quickWin = init.quickWin;
  }

  const pitch = extractBlock("__AI_PITCH__");
  if (pitch) result.pitch = typeof pitch === "string" ? { tagline: pitch, description: "", highlights: [] } : pitch;

  const readme = extractBlock("__AI_README__");
  if (readme) result.readme = typeof readme === "string" ? readme : readme.content ?? JSON.stringify(readme, null, 2);

  const resources = extractBlock("__AI_RESOURCES__");
  if (Array.isArray(resources)) result.suggestedResources = resources;
  else if (resources && typeof resources === "object") result.suggestedResources = resources.suggestedResources ?? [resources];

  return Object.keys(result).length > 0 ? result : null;
}

export default function ProjetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const campSlug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(GENERATING_MESSAGES[0]);
  const [nudge, setNudge] = useState<any>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [heritage, setHeritage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabId>("roadmap");
  const [progressLog, setProgressLog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [heritageLoading, setHeritageLoading] = useState(false);

  useEffect(() => {
    if (!isGenerating) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % GENERATING_MESSAGES.length;
      setGeneratingMessage(GENERATING_MESSAGES[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const { project: data } = await res.json();
        if (data) {
          setProject(data);
          const parsed = parseAiData(data.description);
          if (parsed) setAiData(parsed);
        }
      }
    } catch (err) {
      console.error("Erreur chargement projet:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchNudge = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/nudge`, { method: "POST" });
      if (res.ok) {
        const { data } = await res.json();
        setNudge(data);
      }
    } catch {}
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchNudge();
  }, [fetchProject, fetchNudge]);

  const handleInitRoadmap = async () => {
    setInitLoading(true);
    setIsGenerating(true);
    setGeneratingMessage("Le Compagnon prépare ta roadmap...");
    try {
      const res = await fetch(`/api/projects/${projectId}/init`, { method: "POST" });
      if (res.ok) {
        const { data } = await res.json();
        setAiData((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Erreur init roadmap:", err);
    } finally {
      setInitLoading(false);
      setIsGenerating(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, { method: "POST" });
      if (res.ok) {
        const { data } = await res.json();
        setAiData((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Erreur génération IA:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHeritage = async () => {
    setHeritageLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/heritage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Projet terminé" }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setHeritage(data);
        setActiveTab("heritage");
      }
    } catch (err) {
      console.error("Erreur héritage:", err);
    } finally {
      setHeritageLoading(false);
    }
  };

  const handleProgress = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/progress`, { method: "POST" });
      if (res.ok) {
        const { data } = await res.json();
        setProgressLog(typeof data === "string" ? data : data?.log ?? JSON.stringify(data));
      }
    } catch (err) {
      console.error("Erreur progression:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReadme = async () => {
    if (!aiData?.readme) return;
    const text = typeof aiData.readme === "string" ? aiData.readme : aiData.readme.content ?? JSON.stringify(aiData.readme, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTab = (tab: TabId): boolean => {
    if (!aiData) return false;
    switch (tab) {
      case "roadmap": return Array.isArray(aiData.roadmap) && aiData.roadmap.length > 0;
      case "pitch": return !!aiData.pitch;
      case "readme": return !!aiData.readme;
      case "resources": return Array.isArray(aiData.suggestedResources) && aiData.suggestedResources.length > 0;
      case "heritage": return !!heritage;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-400">Le Compagnon ouvre ton projet...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Projet introuvable.</p>
          <Button variant="outline" onClick={() => router.push(`/camp/${campSlug}/projets`)}>
            Retour aux projets
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        {/* TOP BAR */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => router.push(`/camp/${campSlug}/projets`)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Retour aux projets
          </button>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {aiData ? "Régénérer IA" : "Générer IA"}
            </Button>
            <Button
              onClick={handleHeritage}
              disabled={heritageLoading}
              variant="outline"
              className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {heritageLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Archive className="size-4" />
              )}
              Héritage
            </Button>
          </div>
        </motion.div>

        {/* GENERATING OVERLAY */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-slate-900 p-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/20" />
                  <div className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
                    <Sparkles className="size-8 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">{generatingMessage}</p>
                  <p className="text-xs text-slate-400">Cela peut prendre quelques secondes</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROJECT HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/10">
                  <Compass className="size-6 text-rose-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-white truncate">{project.title}</h1>
                  {project.description && !project.description.includes("__AI_INIT__") && (
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{project.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Créé le {new Date(project.created_at).toLocaleDateString("fr-FR")}</span>
                    {project.community_id && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 border border-slate-700">Communauté</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NUDGE BANNER */}
        <AnimatePresence>
          {nudge && !nudgeDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <AlertTriangle className="size-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-200">{nudge.nudgeMessage}</p>
                    {nudge.microObjective && (
                      <p className="mt-1 text-xs text-amber-300/70">
                        Micro-objectif : {nudge.microObjective}
                      </p>
                    )}
                    {nudge.encouragement && (
                      <p className="mt-1 text-xs italic text-amber-400/50">{nudge.encouragement}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setNudgeDismissed(true)}
                    className="shrink-0 rounded-lg p-1 text-amber-400/50 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI COMPANION TABS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-1 backdrop-blur">
            {(["roadmap", "pitch", "readme", "resources", "heritage"] as TabId[]).map((tab) => {
              const { label, icon: Icon } = TAB_LABELS[tab];
              const isActive = activeTab === tab;
              const exists = hasTab(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {exists && !isActive && (
                    <Check className="size-3 text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ROADMAP TAB */}
            {activeTab === "roadmap" && (
              <div className="space-y-4">
                {aiData?.roadmap && aiData.roadmap.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-rose-500/50 via-pink-500/30 to-transparent" />
                    <div className="space-y-4">
                      {aiData.roadmap.map((day: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative pl-14"
                        >
                          <div className="absolute left-3.5 top-6 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
                            {day.day ?? i + 1}
                          </div>
                          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur hover:border-rose-500/20 transition-colors">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="size-4 text-rose-400" />
                                <h3 className="text-sm font-bold text-white">
                                  Jour {day.day ?? i + 1}
                                  {day.title && (
                                    <span className="ml-2 font-normal text-slate-400">
                                      — {day.title}
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <ul className="space-y-2">
                                {(day.tasks ?? day.items ?? []).map(
                                  (task: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                                      <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-rose-400" />
                                      <span>{task}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-10 text-center space-y-4">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/10">
                        <Calendar className="size-8 text-rose-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Aucune roadmap pour l&apos;instant
                        </p>
                        <p className="text-xs text-slate-400">
                          Le Compagnon va créer un plan jour par jour pour ton projet
                        </p>
                      </div>
                      <Button
                        onClick={handleInitRoadmap}
                        disabled={initLoading}
                        className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      >
                        {initLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Wand2 className="size-4" />
                        )}
                        Générer la roadmap
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* PITCH TAB */}
            {activeTab === "pitch" && (
              <div className="space-y-4">
                {aiData?.pitch ? (
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
                    <CardContent className="p-8 space-y-6">
                      {aiData.pitch.tagline && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-rose-400 font-medium mb-2">
                            Tagline
                          </p>
                          <p className="text-2xl font-bold text-white leading-tight">
                            {aiData.pitch.tagline}
                          </p>
                        </div>
                      )}
                      {aiData.pitch.description && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-rose-400 font-medium mb-2">
                            Description
                          </p>
                          <p className="text-sm leading-relaxed text-slate-300">
                            {aiData.pitch.description}
                          </p>
                        </div>
                      )}
                      {aiData.pitch.highlights && aiData.pitch.highlights.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-rose-400 font-medium mb-3">
                            Points forts
                          </p>
                          <div className="space-y-2">
                            {aiData.pitch.highlights.map((h: string, i: number) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/5 p-3"
                              >
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                                <span className="text-sm text-slate-300">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-10 text-center space-y-4">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/10">
                        <PenLine className="size-8 text-rose-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Aucun pitch pour l&apos;instant
                        </p>
                        <p className="text-xs text-slate-400">
                          Le Compagnon va créer un pitch percutant pour ton projet
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      >
                        <Wand2 className="size-4" />
                        Générer le pitch
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* README TAB */}
            {activeTab === "readme" && (
              <div className="space-y-4">
                {aiData?.readme ? (
                  <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
                    <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-rose-400" />
                        <span className="text-sm font-medium text-white">README.md</span>
                      </div>
                      <button
                        onClick={handleCopyReadme}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3 text-emerald-400" />
                            Copié !
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Copier
                          </>
                        )}
                      </button>
                    </div>
                    <CardContent className="p-0">
                      <pre className="overflow-x-auto p-5 text-sm leading-relaxed font-mono text-slate-300 bg-slate-950/50">
                        <code>
                          {typeof aiData.readme === "string"
                            ? aiData.readme
                            : aiData.readme.content ??
                              JSON.stringify(aiData.readme, null, 2)}
                        </code>
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-10 text-center space-y-4">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/10">
                        <BookOpen className="size-8 text-rose-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Aucun README pour l&apos;instant
                        </p>
                        <p className="text-xs text-slate-400">
                          Le Compagnon va rédiger un README complet pour ton projet
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      >
                        <Wand2 className="size-4" />
                        Générer le README
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* RESOURCES TAB */}
            {activeTab === "resources" && (
              <div className="space-y-4">
                {aiData?.suggestedResources && aiData.suggestedResources.length > 0 ? (
                  <div className="space-y-3">
                    {aiData.suggestedResources.map((res: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur hover:border-rose-500/20 transition-colors">
                          <CardContent className="flex items-center justify-between p-4 gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/10">
                                <LinkIcon className="size-5 text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {res.title ?? res.name}
                                </p>
                                <span className="inline-block rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
                                  {res.type}
                                </span>
                              </div>
                            </div>
                            {res.url && (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
                              >
                                <ExternalLink className="size-3" />
                                Ouvrir
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-10 text-center space-y-4">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/10">
                        <LinkIcon className="size-8 text-rose-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Aucune ressource suggérée
                        </p>
                        <p className="text-xs text-slate-400">
                          Le Compagnon va trouver les meilleures ressources pour t&apos;aider
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                      >
                        <Wand2 className="size-4" />
                        Suggérer des ressources
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* HERITAGE TAB */}
            {activeTab === "heritage" && (
              <div className="space-y-4">
                {heritage ? (
                  <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                    <CardContent className="p-6 space-y-5">
                      {heritage.summary && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-2">
                            Résumé
                          </p>
                          <p className="text-sm leading-relaxed text-slate-300">{heritage.summary}</p>
                        </div>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {heritage.whatWorked && (
                          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400 mb-2">
                              Ce qui a fonctionné
                            </p>
                            <p className="text-sm text-slate-300">{heritage.whatWorked}</p>
                          </div>
                        )}
                        {heritage.whatDidnt && (
                          <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-400 mb-2">
                              Ce qui n&apos;a pas fonctionné
                            </p>
                            <p className="text-sm text-slate-300">{heritage.whatDidnt}</p>
                          </div>
                        )}
                      </div>
                      {heritage.remainingTasks && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-2">
                            Tâches restantes
                          </p>
                          <p className="text-sm text-slate-300">{heritage.remainingTasks}</p>
                        </div>
                      )}
                      {heritage.handoffNotes && (
                        <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-2">
                            Notes de passation
                          </p>
                          <p className="text-sm italic text-slate-400">{heritage.handoffNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="p-10 text-center space-y-4">
                      <div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/10">
                        <Archive className="size-8 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">
                          Aucune carte d&apos;héritage
                        </p>
                        <p className="text-xs text-slate-400">
                          Sauvegarde l&apos;avancement de ton projet pour les prochains
                        </p>
                      </div>
                      <Button
                        onClick={handleHeritage}
                        disabled={heritageLoading}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      >
                        {heritageLoading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Archive className="size-4" />
                        )}
                        Générer la carte d&apos;héritage
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* PROGRESS LOG SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Journal de progression</h3>
                </div>
                <Button
                  onClick={handleProgress}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {isGenerating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Target className="size-3" />
                  )}
                  Mettre à jour
                </Button>
              </div>
              {progressLog ? (
                <div className="rounded-xl bg-slate-950/50 border border-slate-800 p-4">
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {progressLog}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-950/30 border border-slate-800/50 p-6 text-center">
                  <p className="text-sm text-slate-500 italic">
                    Aucun journal pour l&apos;instant. Le Compagnon te suivra au fil de l&apos;avancement.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
