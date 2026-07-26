"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

const steps = [
  {
    kicker: "Bienvenue",
    image: "/multitache.png",
    accent: "#f6dce9",
    title: "Ne perds plus jamais le fil de tes projets",
    description:
      "Reprise garde la trace de chaque effort, pour que reprendre un projet abandonné prenne 10 secondes, pas 10 heures.",
    gradient: ["from-[#a92940]", "to-[#62121b]"],
    blobs: [
      { pos: "top-12 right-10", size: "w-40 h-40", opacity: "bg-white/[0.06]" },
      { pos: "bottom-16 left-8", size: "w-56 h-56", opacity: "bg-white/[0.08]" },
    ],
  },
  {
    kicker: "",
    image: "/objectif.png",
    accent: "#f2c7d1",
    title: "Crée un projet ou un objectif",
    description:
      "Nom, objectif, technologies, étapes principales.",
    gradient: ["from-[#c04b65]", "to-[#a92940]"],
    blobs: [
      { pos: "top-8 left-12", size: "w-48 h-48", opacity: "bg-white/[0.08]" },
      { pos: "bottom-10 right-6", size: "w-36 h-36", opacity: "bg-white/[0.06]" },
    ],
  },
  {
    kicker: "",
    image: "/le-progres.png",
    accent: "#f6dce9",
    title: "Suis ta progression, visuellement",
    description:
      "Tâches terminées, en cours, jours d'activité.",
    gradient: ["from-[#d8699e]", "to-[#c04b65]"],
    blobs: [
      { pos: "top-16 right-14", size: "w-44 h-44", opacity: "bg-white/[0.06]" },
      { pos: "bottom-8 left-14", size: "w-52 h-52", opacity: "bg-white/[0.08]" },
    ],
  },
  {
    kicker: "",
    image: "/gestion-du-temps.png",
    accent: "#f0bcc9",
    title: "Reprends là où tu t'es arrêté",
    description:
      "Retrouve ton blocage, ta note, et la prochaine étape.",
    gradient: ["from-[#a92940]", "to-[#62121b]"],
    blobs: [
      { pos: "top-10 left-6", size: "w-40 h-40", opacity: "bg-white/[0.08]" },
      { pos: "bottom-14 right-10", size: "w-48 h-48", opacity: "bg-white/[0.06]" },
    ],
  },
  {
    kicker: "",
    image: "/configuration.png",
    accent: "#f6dce9",
    title: "Un assistant IA pour continuer",
    description:
      "Résume ton avancement, comprend ton blocage, propose la plus petite étape suivante.",
    gradient: ["from-[#62121b]", "to-[#3a0b10]"],
    blobs: [
      { pos: "top-14 right-8", size: "w-52 h-52", opacity: "bg-white/[0.08]" },
      { pos: "bottom-6 left-10", size: "w-40 h-40", opacity: "bg-white/[0.06]" },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))
  const goTo = (i: number) => setStep(i)
  const skip = () => router.push("/choix-communaute")

  const current = steps[step]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#3a0e15_0%,#1c0509_55%,#120306_100%)]">
      <div className="flex h-[680px] w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-[#1c0509] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* Left column — illustration */}
        <div className="relative flex flex-[1.1] items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute inset-0 bg-gradient-to-br ${current.gradient[0]} ${current.gradient[1]}`}
            />
          </AnimatePresence>

          {current.blobs.map((blob, i) => (
            <div
              key={`${step}-${i}`}
              className={`absolute rounded-full ${blob.size} ${blob.pos} ${blob.opacity}`}
            />
          ))}

          <AnimatePresence mode="wait">
            <motion.div
              key={`glass-${step}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex h-[180px] w-[180px] items-center justify-center rounded-[36px] border border-white/25 bg-white/[0.14] shadow-2xl backdrop-blur-xl overflow-hidden"
            >
              <img
                src={current.image}
                alt={current.kicker}
                className="h-full w-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {/* Pagination dots */}
          <div className="absolute bottom-7 left-7 right-7 z-10 flex gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-2 cursor-pointer rounded-full p-0 border-0 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <motion.div
                  animate={{
                    width: i === step ? 24 : 8,
                    backgroundColor: i === step ? "#ffffff" : "rgba(255,255,255,0.35)",
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="h-2 rounded-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right column — content */}
        <div className="flex flex-1 flex-col justify-between bg-[#210709] p-11">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-[22px] w-[22px] rounded-[7px] bg-gradient-to-br from-[#d8699e] to-[#a92940]" />
              <span className="font-extrabold text-[#f6dce9]">Reprise</span>
            </div>
            <button
              onClick={skip}
              className="cursor-pointer text-sm text-[#c0808f] transition-colors hover:text-[#f6dce9]"
            >
              Passer
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {current.kicker && (
                <p
                  className="mb-4 text-[11.5px] font-bold uppercase tracking-widest"
                  style={{ color: current.accent }}
                >
                  {current.kicker}
                </p>
                )}
                <h2 className="mb-4 text-[32px] font-extrabold leading-tight tracking-tight text-[#fdf1f3]">
                  {current.title}
                </h2>
                <p className="max-w-[400px] text-[15px] leading-relaxed text-[#c9a3ab]">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3">
            <div className="w-[92px] shrink-0">
              <AnimatePresence mode="wait">
                {step > 0 ? (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Button
                      variant="outline"
                      onClick={back}
                      className="rounded-xl border-[#d8699e]/30 text-[#f0c8d1] hover:bg-[#d8699e]/10 hover:text-[#f6dce9]"
                    >
                      Retour
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            <Button
              onClick={isLast ? skip : next}
              className="flex-1 rounded-xl bg-gradient-to-br from-[#f6dce9] to-[#d8699e] text-[#2a0509] font-bold shadow-[0_10px_24px_-8px_rgba(216,105,158,0.5)] hover:from-[#f0c8d1] hover:to-[#d8699e]/90"
            >
              {isLast ? "Commencer" : "Continuer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}