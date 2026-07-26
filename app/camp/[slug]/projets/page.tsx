"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, Loader2, Sparkles, Trash2 } from "lucide-react";
import { ProjectStatusBadge, type ProjectStatus } from "@/components/projects/ProjectStatusBadge";
import { AbandonProjectModal, type AbandonChoice } from "@/components/projects/AbandonProjectModal";

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
  project_status: ProjectStatus;
}

export default function ProjetsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [abandonTarget, setAbandonTarget] = useState<Project | null>(null);
  const [submittingAbandon, setSubmittingAbandon] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      try {
        const slugRes = await fetch(`/api/communities/by-slug/${slug}`);
        if (!slugRes.ok || cancelled) return;
        const { community } = await slugRes.json();

        const res = await fetch(`/api/projects?communityId=${community.id}`);
        if (res.ok && !cancelled) {
          const { projects: data } = await res.json();
          if (data) setProjects(data);
        }
      } catch (err) {
        console.error("Erreur chargement projets:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProjects();
    return () => { cancelled = true; };
  }, [slug]);

  const handleGenerateIA = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setGeneratingId(projectId);
    try {
      await fetch(`/api/projects/${projectId}/generate`, { method: "POST" });
    } catch (err) {
      console.error("Erreur génération IA:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleAbandonConfirm = async (choice: AbandonChoice) => {
    if (!abandonTarget) return;
    setSubmittingAbandon(true);
    try {
      const res = await fetch(`/api/projects/${abandonTarget.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_status: choice }),
      });
      if (res.ok) {
        const { project: updated } = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === abandonTarget.id ? { ...p, project_status: updated.project_status } : p))
        );
        setAbandonTarget(null);
      }
    } catch (err) {
      console.error("Erreur changement de statut:", err);
    } finally {
      setSubmittingAbandon(false);
    }
  };

  const getResourceCount = (resourcesStr: string | null) => {
    if (!resourcesStr) return 0;
    try {
      return JSON.parse(resourcesStr).length;
    } catch {
      return 0;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projets</h1>
            <p className="mt-2 text-slate-600">
              Gère tes projets et laisse l&apos;IA t&apos;accompagner
            </p>
          </div>
          <Button onClick={() => router.push(`/camp/${slug}/projets/nouveau`)} className="gap-2">
            <Plus className="size-4" />
            Nouveau projet
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/camp/${slug}/projets/${project.id}`} className="block">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                      <ProjectStatusBadge status={project.project_status} />
                    </div>
                    {project.description && (
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-4" />
                        <span>{getResourceCount(project.resources)} ressource(s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-4" />
                        <span>{new Date(project.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => handleGenerateIA(e, project.id)}
                        disabled={generatingId === project.id}
                        className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {generatingId === project.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Sparkles className="size-3" />
                        )}
                        Générer IA
                      </button>
                      {project.created_by === currentUserId && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAbandonTarget(project);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="size-3" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="size-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900">Aucun projet</h3>
              <p className="mb-6 text-sm text-slate-500">
                Crée ton premier projet et laisse l&apos;IA t&apos;accompagner.
              </p>
              <Button onClick={() => router.push(`/camp/${slug}/projets/nouveau`)} className="gap-2">
                <Plus className="size-4" />
                Créer un projet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AbandonProjectModal
        open={!!abandonTarget}
        projectTitle={abandonTarget?.title ?? ""}
        submitting={submittingAbandon}
        onClose={() => !submittingAbandon && setAbandonTarget(null)}
        onConfirm={handleAbandonConfirm}
      />
    </main>
  );
}
