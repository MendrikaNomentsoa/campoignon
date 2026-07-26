"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Plus,
  Loader2,
  Users,
  Star,
  Crown,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CountdownBadge } from "@/components/challenges/CountdownBadge";

interface ChallengeParticipant {
  id: string;
  user_id: string;
  total_points: number;
  progress: number;
  status: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  reward: string | null;
  status: "open" | "in_progress" | "finished";
  deadline: string | null;
  creator_id: string;
  winner_id: string | null;
  challenge_participants: ChallengeParticipant[];
}

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  status: string;
  profiles: { username: string } | null;
}

const STATUS_LABEL: Record<Challenge["status"], string> = {
  open: "Ouvert",
  in_progress: "En cours",
  finished: "Terminé",
};

const STATUS_CLASSES: Record<Challenge["status"], string> = {
  open: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  in_progress: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  finished: "bg-foreground/10 text-foreground/40 border-foreground/10",
};

export function ChallengesPanel({ communityId }: { communityId: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [leaderboardOpenId, setLeaderboardOpenId] = useState<string | null>(null);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/challenges?communityId=${communityId}`);
      if (!res.ok) throw new Error("Impossible de charger les défis");
      const { challenges: data } = await res.json();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCurrentUserId(data?.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setFormError(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          community_id: communityId,
          title: title.trim(),
          description: description.trim() || undefined,
          reward: reward.trim() || undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de créer le défi");

      setTitle("");
      setDescription("");
      setReward("");
      setDeadline("");
      setShowForm(false);
      await loadChallenges();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (challengeId: string) => {
    setPendingId(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      if (res.ok) await loadChallenges();
    } finally {
      setPendingId(null);
    }
  };

  const handleClose = async (challengeId: string) => {
    setPendingId(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/finish`, { method: "POST" });
      if (res.ok) await loadChallenges();
    } finally {
      setPendingId(null);
    }
  };

  const toggleLeaderboard = async (challengeId: string) => {
    if (leaderboardOpenId === challengeId) {
      setLeaderboardOpenId(null);
      return;
    }
    setLeaderboardOpenId(challengeId);
    if (!leaderboards[challengeId]) {
      const res = await fetch(`/api/challenges/${challengeId}/leaderboard`);
      if (res.ok) {
        const { leaderboard } = await res.json();
        setLeaderboards((prev) => ({ ...prev, [challengeId]: leaderboard ?? [] }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-foreground/40" />
      </div>
    );
  }

  if (error) {
    return <p className="py-10 text-center text-sm text-rose-400">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-400" />
          <h3 className="text-sm font-medium text-foreground/70">
            {challenges.length} défi{challenges.length > 1 ? "s" : ""}
          </h3>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-burgundy-500 to-rose-400 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-400/20 transition-all hover:brightness-110"
        >
          <Plus className="size-3.5" />
          Nouveau défi
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-5"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du défi (ex: Adopte un projet Java abandonné)"
            className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-rose-400 focus:outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du défi..."
            rows={2}
            className="w-full resize-none rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-rose-400 focus:outline-none"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="Récompense (optionnel)"
              className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-rose-400 focus:outline-none"
            />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground/80 focus:border-rose-400 focus:outline-none [color-scheme:dark]"
            />
          </div>
          {formError && <p className="text-xs text-rose-400">{formError}</p>}
          <button
            type="submit"
            disabled={!title.trim() || creating}
            className="rounded-xl bg-linear-to-r from-burgundy-500 to-rose-400 px-5 py-2 text-sm font-medium text-white transition-all disabled:opacity-40"
          >
            {creating ? "Création..." : "Créer le défi"}
          </button>
        </motion.form>
      )}

      {challenges.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/30">
          Aucun défi pour l&apos;instant. Lance le premier !
        </p>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const isParticipant = challenge.challenge_participants.some(
              (p) => p.user_id === currentUserId
            );
            const myParticipation = challenge.challenge_participants.find(
              (p) => p.user_id === currentUserId
            );
            const isCreator = challenge.creator_id === currentUserId;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-foreground/5 bg-foreground/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-foreground/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground">{challenge.title}</h4>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASSES[challenge.status]}`}
                      >
                        {STATUS_LABEL[challenge.status]}
                      </span>
                    </div>
                    {challenge.description && (
                      <p className="mt-1.5 text-sm text-foreground/50">{challenge.description}</p>
                    )}
                  </div>
                  <CountdownBadge deadline={challenge.deadline} />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-foreground/40">
                  {challenge.reward && (
                    <span className="flex items-center gap-1">
                      <Trophy className="size-3.5 text-amber-400/70" />
                      {challenge.reward}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" />
                    {challenge.challenge_participants.length} participant
                    {challenge.challenge_participants.length > 1 ? "s" : ""}
                  </span>
                </div>

                {isParticipant && myParticipation && challenge.status !== "finished" && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-foreground/30">
                      <span>Ta progression</span>
                      <span>{myParticipation.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-burgundy-500 to-rose-400"
                        style={{ width: `${myParticipation.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!isParticipant && challenge.status !== "finished" && (
                    <button
                      onClick={() => handleJoin(challenge.id)}
                      disabled={pendingId === challenge.id}
                      className="rounded-lg bg-linear-to-r from-burgundy-500 to-rose-400 px-3.5 py-1.5 text-xs font-medium text-white transition-all disabled:opacity-40"
                    >
                      Rejoindre
                    </button>
                  )}
                  {isCreator && challenge.status !== "finished" && (
                    <button
                      onClick={() => handleClose(challenge.id)}
                      disabled={pendingId === challenge.id}
                      className="flex items-center gap-1 rounded-lg bg-foreground/5 px-3.5 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                      <Flag className="size-3.5" />
                      Clôturer
                    </button>
                  )}
                  <button
                    onClick={() => toggleLeaderboard(challenge.id)}
                    className="flex items-center gap-1 rounded-lg bg-foreground/5 px-3.5 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                  >
                    <Crown className="size-3.5 text-amber-400/70" />
                    Classement
                    {leaderboardOpenId === challenge.id ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>
                </div>

                {leaderboardOpenId === challenge.id && (
                  <div className="mt-3 space-y-1.5 border-t border-foreground/5 pt-3">
                    {(leaderboards[challenge.id] ?? []).length === 0 ? (
                      <p className="text-xs text-foreground/30">Pas encore de participant classé.</p>
                    ) : (
                      leaderboards[challenge.id].map((entry, i) => (
                        <div
                          key={entry.user_id}
                          className="flex items-center gap-2 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs"
                        >
                          <span className="w-4 font-bold text-foreground/30">{i + 1}</span>
                          <span className="flex-1 truncate text-foreground/70">
                            {entry.profiles?.username ?? "Membre"}
                          </span>
                          <Star className="size-3 text-amber-400/60" />
                          <span className="text-foreground/50">{entry.total_points}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
