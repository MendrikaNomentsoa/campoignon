"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Trophy } from "lucide-react";
import { getCommunityStyle } from "@/lib/communityStyles";
import { CountdownBadge } from "@/components/challenges/CountdownBadge";

interface UpcomingChallenge {
  id: string;
  title: string;
  reward: string | null;
  status: string;
  deadline: string;
  community_id: string;
  communities: { name: string } | null;
}

const POLL_INTERVAL_MS = 60_000;

function countUrgent(challenges: UpcomingChallenge[]): number {
  return challenges.filter((c) => {
    const hoursLeft = (new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 24;
  }).length;
}

export function ChallengeNotificationBell() {
  const [open, setOpen] = useState(false);
  const [challenges, setChallenges] = useState<UpcomingChallenge[]>([]);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/challenges/upcoming");
        if (res.status === 401) {
          if (!cancelled) {
            setAuthed(false);
            setChallenges([]);
          }
          return;
        }
        if (!res.ok) return;
        const { challenges: data } = await res.json();
        const list: UpcomingChallenge[] = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setAuthed(true);
          setChallenges(list);
          setUrgentCount(countUrgent(list));
        }
      } catch {
        // silencieux : la cloche reste vide en cas d'erreur réseau
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!authed && !loading) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        aria-label="Défis en cours"
      >
        <Bell className="size-5" />
        {challenges.length > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${
              urgentCount > 0 ? "bg-red-500" : "bg-rose-400"
            }`}
          >
            {challenges.length > 9 ? "9+" : challenges.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-foreground/10 bg-popover shadow-2xl shadow-black/40"
          >
            <div className="flex items-center gap-2 border-b border-foreground/5 px-4 py-3">
              <Trophy className="size-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Défis en cours</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {challenges.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-foreground/30">
                  Aucun défi avec échéance pour l&apos;instant.
                </p>
              ) : (
                challenges.map((challenge) => {
                  const communityName = challenge.communities?.name ?? "Communauté";
                  const style = getCommunityStyle(communityName);
                  const Icone = style.icone;

                  return (
                    <Link
                      key={challenge.id}
                      href={`/camp/${challenge.community_id}/communaute?tab=defis`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 border-b border-foreground/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-foreground/5"
                    >
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style.couleur}`}>
                        <Icone className="size-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground/40">{communityName}</p>
                        <p className="truncate text-sm font-medium text-foreground/90">{challenge.title}</p>
                        <div className="mt-1.5">
                          <CountdownBadge deadline={challenge.deadline} />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
