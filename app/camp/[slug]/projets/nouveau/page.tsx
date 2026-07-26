"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Link as LinkIcon,
  FileText,
  X,
  Sparkles,
  Loader2,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface Resource {
  type: "pdf" | "link";
  name: string;
  url: string;
  file?: File;
  file_size?: number;
}

export default function NouveauProjetPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf") {
        setResources((prev) => [
          ...prev,
          { type: "pdf", name: file.name, url: URL.createObjectURL(file), file, file_size: file.size },
        ]);
      }
    });
    e.target.value = "";
  }, []);

  const addLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
    setResources((prev) => [...prev, { type: "link", name: newLinkName.trim(), url }]);
    setNewLinkName("");
    setNewLinkUrl("");
    setShowLinkForm(false);
  };

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (analyze: boolean = false) => {
    if (!title.trim()) {
      setError("Le titre du projet est requis");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Résoudre le slug en UUID
      const slugRes = await fetch(`/api/communities/by-slug/${slug}`);
      if (!slugRes.ok) throw new Error("Communauté introuvable");
      const { community } = await slugRes.json();

      // 2. Créer le projet
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          resources: resources.map(({ file: _file, ...r }) => r),
          community_id: community.id,
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Erreur lors de la création");
      }

      const { project } = await createRes.json();

      // 3. Analyser avec l'IA si demandé
      if (analyze) {
        setIsAnalyzing(true);
        await fetch(`/api/projects/${project.id}/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: description.trim() || null,
            resources: resources.map(({ file: _file, ...r }) => r),
          }),
        });
      }

      // 4. Rediriger
      router.push(`/camp/${slug}/projets/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
  };

  const canSubmit = !isSubmitting && !isAnalyzing && title.trim().length > 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/camp/${slug}/projets`)} className="mb-4 gap-2">
            <ArrowLeft className="size-4" />
            Retour aux projets
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Nouveau projet</h1>
          <p className="mt-2 text-slate-600">
            Décris ton projet, ajoute des ressources et laisse l&apos;IA t&apos;accompagner.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>
              Décris ton projet pour que l&apos;IA puisse mieux t&apos;accompagner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du projet *</Label>
              <Input id="title" placeholder="Ex: Créer un composant Dashboard réutilisable" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Décris brièvement ton projet..." value={description} onChange={(e) => setDescription(e.target.value)} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Ressources
            </CardTitle>
            <CardDescription>
              Ajoute des PDF ou des liens pour que l&apos;IA analyse ton projet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
              <Upload className="mx-auto mb-3 size-8 text-slate-400" />
              <p className="mb-2 text-sm font-medium text-slate-700">Ajouter des PDF</p>
              <p className="mb-3 text-xs text-slate-500">Glisse-dépose ou clique pour sélectionner</p>
              <div className="relative inline-block">
                <input type="file" accept=".pdf,application/pdf" multiple onChange={handleFileUpload} className="absolute inset-0 cursor-pointer opacity-0" id="file-upload" />
                <label htmlFor="file-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                  <Upload className="size-4" />
                  Choisir des fichiers
                </label>
              </div>
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
                  <Input placeholder="Nom du lien (ex: Documentation API)" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} className="h-9" />
                  <Input placeholder="URL (ex: https://docs.example.com)" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="h-9" />
                  <Button size="sm" onClick={addLink} disabled={!newLinkName.trim() || !newLinkUrl.trim()} className="gap-2">
                    <Plus className="size-4" />
                    Ajouter
                  </Button>
                </div>
              </div>
            )}

            {resources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Ressources ajoutées ({resources.length})</p>
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-3">
                      {resource.type === "pdf" ? (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-red-100">
                          <FileText className="size-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100">
                          <LinkIcon className="size-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{resource.name}</p>
                        <p className="text-xs text-slate-500">
                          {resource.type === "pdf" ? (resource.file_size ? formatFileSize(resource.file_size) : "PDF") : resource.url}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeResource(index)} className="text-slate-400 hover:text-red-600">
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => handleSubmit(false)} disabled={!canSubmit} variant="outline" className="flex-1 gap-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Créer sans analyse IA
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={!canSubmit} className="flex-1 gap-2">
            {isAnalyzing ? (
              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Génération en cours...</span>
                <span className="text-xs text-primary-foreground/70">L&apos;IA prépare ta feuille de route...</span>
              </span>
            ) : isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <><Sparkles className="size-4" /> Créer et générer la roadmap IA</>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
