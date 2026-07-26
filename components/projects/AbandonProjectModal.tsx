"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, Loader2, PauseCircle, X } from "lucide-react";

export type AbandonChoice = "adoptable" | "paused";

export function AbandonProjectModal({
  open,
  projectTitle,
  submitting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  projectTitle: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (choice: AbandonChoice) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border border-foreground/10 bg-popover p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Abandonner « {projectTitle} » ?</h2>
                <p className="mt-1 text-sm text-foreground/50">
                  Ton projet n&apos;est jamais supprimé. Choisis simplement ce qu&apos;il devient.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={submitting}
                className="shrink-0 rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => onConfirm("adoptable")}
                disabled={submitting}
                className="group flex w-full items-start gap-3 rounded-xl border-2 border-emerald-400/30 bg-emerald-400/10 p-4 text-left transition-all hover:border-emerald-400/60 hover:bg-emerald-400/15 disabled:opacity-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20">
                  <HeartHandshake className="size-5 text-emerald-500 dark:text-emerald-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Abandonner &amp; Transmettre</span>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                      Recommandé
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/55">
                    Le projet passe en <strong>« À adopter »</strong> et reste visible par la communauté.
                    Le Compagnon IA génère automatiquement une fiche résumé (ce qui est fait / ce qu&apos;il reste à faire)
                    pour la prochaine personne qui reprendra le flambeau.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onConfirm("paused")}
                disabled={submitting}
                className="group flex w-full items-start gap-3 rounded-xl border border-foreground/10 bg-foreground/5 p-4 text-left transition-all hover:border-foreground/20 hover:bg-foreground/10 disabled:opacity-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/10">
                  <PauseCircle className="size-5 text-foreground/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground">Mettre en pause</span>
                  <p className="mt-1 text-sm text-foreground/55">
                    Le projet reste à toi, simplement mis de côté. Personne d&apos;autre n&apos;y touche —
                    tu pourras le reprendre quand tu veux.
                  </p>
                </div>
              </button>
            </div>

            {submitting && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground/40">
                <Loader2 className="size-4 animate-spin" />
                Mise à jour du projet...
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
