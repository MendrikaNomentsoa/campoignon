"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Link as LinkIcon,
  Upload,
  Plus,
  X,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface Resource {
  type: "pdf" | "link";
  name: string;
  url: string;
  file_size?: number;
}

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

export default function RessourcesProjetPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok && !cancelled) {
          const { project: data } = await res.json();
          if (data) {
            setProject(data);
            setResources(data.parsed_resources || []);
          }
        }
      } catch (err) {
        console.error("Erreur chargement projet:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProject();
    return () => { cancelled = true; };
  }, [projectId]);

  const saveResources = async (newResources: Resource[]) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resources: newResources }),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsAdding(true);
    const newResources = [...resources];

    for (const file of Array.from(files)) {
      if (file.type === "application/pdf") {
        newResources.push({
          type: "pdf",
          name: file.name,
          url: URL.createObjectURL(file),
          file_size: file.size,
        });
      }
    }

    setResources(newResources);
    await saveResources(newResources);
    setIsAdding(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addLink = async () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const newResource: Resource = { type: "link", name: newLinkName.trim(), url };
    const newResources = [newResource, ...resources];
    setResources(newResources);
    await saveResources(newResources);
    setNewLinkName("");
    setNewLinkUrl("");
    setShowLinkForm(false);
  };

  const deleteResource = async (index: number) => {
    const newResources = resources.filter((_, i) => i !== index);
    setResources(newResources);
    await saveResources(newResources);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Ressources</h1>
          <p className="mt-2 text-slate-600">
            {project?.title} — Gère les documents et liens
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ajouter une ressource</CardTitle>
            <CardDescription>
              Ajoute des PDF ou des liens pour enrichir ton projet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-3 size-8 text-slate-400" />
              <p className="mb-1 text-sm font-medium text-slate-700">
                {isAdding ? "Ajout en cours..." : "Glisse-dépose ou clique pour ajouter un PDF"}
              </p>
              <p className="text-xs text-slate-500">Format accepté : PDF</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {!showLinkForm ? (
              <Button variant="outline" onClick={() => setShowLinkForm(true)} className="w-full gap-2">
                <LinkIcon className="size-4" />
                Ajouter un lien
              </Button>
            ) : (
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Nouveau lien</p>
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowLinkForm(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Input placeholder="Nom du lien" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} className="h-9" />
                  <Input placeholder="URL (ex: https://docs.example.com)" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="h-9" />
                  <Button size="sm" onClick={addLink} disabled={isAdding || !newLinkName.trim() || !newLinkUrl.trim()} className="gap-2">
                    {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    Ajouter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ressources ({resources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {resources.length > 0 ? (
              <div className="space-y-2">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      {resource.type === "pdf" ? (
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                          <FileText className="size-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                          <LinkIcon className="size-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{resource.name}</p>
                        <p className="text-xs text-slate-500">
                          {resource.type === "pdf" ? formatFileSize(resource.file_size) : resource.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                        <ExternalLink className="size-3" />
                        Ouvrir
                      </a>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteResource(index)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-3 size-12 text-slate-300" />
                <p className="text-sm text-slate-500">Aucune ressource pour l&apos;instant.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
