"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  CalendarDays,
  Award,
  Rocket,
  LogOut,
  Loader2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCommunity, getCommunityStyle, type CommunityData } from "@/lib/communityStyles";

interface Profile {
  id: string;
  email: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
}

interface Reward {
  id: string;
  label: string;
  awarded_at: string;
  challenge_id: string | null;
}

export default function ProfilPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [communaute, setCommunaute] = useState<CommunityData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [communityData, meRes, rewardsRes, projectsRes] = await Promise.all([
        fetchCommunity(slug),
        fetch("/api/auth/me"),
        fetch("/api/rewards"),
        fetch(`/api/projects?communityId=${slug}`),
      ]);

      if (cancelled) return;

      setCommunaute(communityData);

      if (meRes.ok) {
        const meJson = await meRes.json();
        setProfile({ ...meJson.user, avatar_url: meJson.user.avatar_url ?? null });
      }

      if (rewardsRes.ok) {
        const rewardsJson = await rewardsRes.json();
        setRewards(rewardsJson.rewards ?? []);
      }

      if (projectsRes.ok) {
        const projectsJson = await projectsRes.json();
        setProjectsCount(Array.isArray(projectsJson.projects) ? projectsJson.projects.length : 0);
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const style = communaute ? getCommunityStyle(communaute.name) : getCommunityStyle("default");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/connexion");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${profile.id}.${fileExt}`;

      const { error: uploadError } = await import("@/lib/supabase/admin").then(
        ({ createAdminClient }) => {
          const admin = createAdminClient();
          return admin.storage.from("avatars").upload(filePath, file, { upsert: true });
        }
      );

      if (uploadError) throw uploadError;

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const { data: urlData } = admin.storage.from("avatars").getPublicUrl(filePath);

      await fetch("/api/auth/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: urlData.publicUrl }),
      });

      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : prev));
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-foreground/40" />
      </div>
    );
  }

  const initiale = profile?.username?.charAt(0).toUpperCase() ?? "?";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push(`/camp/${slug}`)}
          className="flex items-center gap-2 text-sm text-foreground/30 transition-colors hover:text-foreground/60"
        >
          <ArrowLeft className="size-4" />
          Retour
        </button>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-foreground/[0.08] p-8"
        >
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 h-3/4 w-20 rounded-full bg-foreground/[0.07] blur-2xl" />
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 h-3/4 w-20 rounded-full bg-foreground/[0.07] blur-2xl" />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-[0.06]`}
          />
          <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <label className="group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className={`flex size-full items-center justify-center bg-gradient-to-br ${style.couleur} text-2xl font-bold text-white`}
                >
                  {initiale}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </div>
            </label>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.username ?? "Utilisateur"}
              </h1>
              <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                {profile?.email && (
                  <span className="flex items-center justify-center gap-1.5 text-sm text-foreground/40 sm:justify-start">
                    <Mail className="size-3.5" />
                    {profile.email}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center justify-center gap-1.5 text-sm text-foreground/40 sm:justify-start">
                    <CalendarDays className="size-3.5" />
                    Membre depuis {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-foreground/[0.08] p-5">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-1/2 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-1/2 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
            <div className="relative">
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-foreground/5">
                <Rocket className="size-4 text-foreground/60" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {projectsCount ?? "—"}
              </p>
              <p className="text-xs text-foreground/35">Projets créés</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-foreground/[0.08] p-5">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-1/2 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-1/2 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
            <div className="relative">
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-[#a92940]/15">
                <Award className="size-4 text-[#a92940] dark:text-[#d8699e]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{rewards.length}</p>
              <p className="text-xs text-foreground/35">Récompenses</p>
            </div>
          </div>
        </motion.div>

        {/* Rewards list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-foreground/[0.08] p-6"
        >
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 h-3/4 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 h-3/4 w-12 rounded-full bg-foreground/[0.07] blur-xl" />
          <h2 className="relative mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/40">
            <Award className="size-4" />
            Récompenses
          </h2>

          {rewards.length > 0 ? (
            <div className="relative space-y-2">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between rounded-lg border border-foreground/[0.08] bg-foreground/[0.05] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#a92940]/15">
                      <Award className="size-4 text-[#a92940] dark:text-[#d8699e]" />
                    </div>
                    <p className="text-sm font-medium text-foreground/80">
                      {reward.label}
                    </p>
                  </div>
                  <span className="text-xs text-foreground/25">
                    {new Date(reward.awarded_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative py-8 text-center">
              <Award className="mx-auto mb-2 size-8 text-foreground/10" />
              <p className="text-sm text-foreground/30">
                Pas encore de récompense. Termine un défi pour en débloquer.
              </p>
            </div>
          )}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full gap-2 border-foreground/10 bg-foreground/[0.05] text-foreground/60 hover:bg-foreground/[0.05] hover:text-[#f0a0b4]"
          >
            {loggingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Se déconnecter
          </Button>
        </motion.div>
      </div>
    </div>
  );
}