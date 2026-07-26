"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Lightbulb,
  Lock,
  Code2,
  Brain,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BarreNavigation } from "@/components/navigation/BarreNavigation";
import { PiedPage } from "@/components/navigation/PiedPage";

const values = [
  {
    icon: Heart,
    title: "Bienveillance d'abord",
    description:
      "Jamais de culpabilisation. Le Compagnon relance avec douceur, célèbre les petits pas, et respecte le rythme de chacun.",
  },
  {
    icon: Users,
    title: "Communauté avant outil",
    description:
      "La technologie s'efface derrière les liens. Campoignon existe pour rapprocher les gens, pas pour les surveiller.",
  },
  {
    icon: Lightbulb,
    title: "Progression visible",
    description:
      "Chaque tâche complétée, chaque jour d'activité laisse une trace. Voir sa progression motiver à continuer.",
  },
  {
    icon: Lock,
    title: "Mémoire collective",
    description:
      "Ce que l'équipe apprend ne se perd pas. Post-mortems, cartes d'héritage, journaux — le savoir reste pour les prochains.",
  },
];

const stack = [
  { name: "Next.js", role: "Framework React" },
  { name: "Supabase", role: "Base de données & Auth" },
  { name: "Groq AI", role: "Moteur du Compagnon" },
  { name: "Tailwind CSS", role: "Design system" },
  { name: "Framer Motion", role: "Animations" },
  { name: "TypeScript", role: "Type safety" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function AProposPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BarreNavigation />

      {/* Hero */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(169,41,64,0.12)_0%,transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Image
              src="/logo.png"
              alt="Campoignon"
              width={72}
              height={72}
              className="mx-auto mb-6 h-18 w-18 object-contain"
              priority
            />
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
              Vigne &amp; Voyages
            </p>
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              L&apos;app qui{" "}
              <span className="bg-gradient-to-r from-[#a92940] to-[#62121b] bg-clip-text text-transparent dark:from-[#d8699e] dark:to-[#f6dce9]">
                garde la trace
              </span>{" "}
              de chaque effort
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/45">
              Campoignon est née d&apos;une conviction simple : les projets
              abandonnés ne sont pas des échecs, ce sont des héritages. Notre
              mission est de transformer chaque arrêt en point de départ pour
              quelqu&apos;un d&apos;autre.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-foreground/5 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div {...fadeUp} viewport={{ once: true }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
                Notre mission
              </p>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Fini les projets qui dorment dans un coin
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-foreground/40">
                Dans chaque équipe, il y a des projets qui commencent avec
                enthousiasme puis ralentissent. Pas par manque de talent — par
                manque de structure, de visibilité, ou simplement parce que la
                vie s&apos;en mêle.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/40">
                Campoignon change la donne : une communauté qui porte, un
                Compagnon IA qui relance sans culpabiliser, et une mémoire
                collective qui transforme chaque经验 en héritage
                transmissible.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-8"
            >
              <div className="absolute -top-20 -right-20 size-40 rounded-full bg-[#a92940]/10 blur-3xl" />
              <div className="relative z-10 space-y-6">
                {[
                  {
                    stat: "73%",
                    text: "des projets open-source sont abandonnés faute de relance",
                  },
                  {
                    stat: "×10",
                    text: "plus de temps pour reprendre un projet que pour le commencer",
                  },
                  {
                    stat: "0",
                    text: "outils qui transforment l'abandon en héritage réutilisable",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="shrink-0 text-2xl font-bold text-[#a92940] dark:text-[#d8699e]">
                      {item.stat}
                    </span>
                    <p className="text-sm text-foreground/40">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-foreground/5 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
              Nos valeurs
            </p>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Ce qui guide chaque décision
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  {...fadeUp}
                  transition={{ delay: 0.08 + i * 0.08 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-7"
                >
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a92940] to-[#d8699e]">
                    <Icon className="size-5 text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-foreground">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/40">
                    {v.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How the AI works */}
      <section className="border-t border-foreground/5 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              {...fadeUp}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-8">
                <div className="absolute -bottom-16 -left-16 size-32 rounded-full bg-[#d8699e]/10 blur-3xl" />
                <div className="relative z-10 space-y-4">
                  {[
                    {
                      icon: Brain,
                      label: "Roadmap auto-générée",
                      detail: "Structure jour par jour dès la création",
                    },
                    {
                      icon: Sparkles,
                      label: "Pitch & README",
                      detail: "Présentation complète en un clic",
                    },
                    {
                      icon: Lightbulb,
                      label: "Détection de blocage",
                      detail: "Micro-objectifs de 15 minutes",
                    },
                    {
                      icon: Heart,
                      label: "Cartes d'héritage",
                      detail: "L'héritage pour les prochains",
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-foreground/[0.03] p-3"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#a92940]/15">
                          <Icon className="size-4 text-[#a92940] dark:text-[#d8699e]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground/80">
                            {item.label}
                          </p>
                          <p className="text-xs text-foreground/30">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
                Le Compagnon
              </p>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Un assistant, pas un chef
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-foreground/40">
                Le Compagnon IA de Campoignon n&apos;est pas là pour donner des
                ordres. Il est là pour comprendre, s&apos;adapter, et proposer
                la plus petite étape possible — celle qu&apos;on peut faire
                maintenant, en 15 minutes.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/40">
                Il détecte les blocages sans juger, célèbre les progrès sans
                exagérer, et quand un projet est abandonné, il en fait une carte
                d&apos;héritage que d&apos;autres pourront reprendre.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-foreground/5 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
              Stack technique
            </p>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Bâti avec des outils modernes
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stack.map((item, i) => (
              <motion.div
                key={item.name}
                {...fadeUp}
                transition={{ delay: 0.06 + i * 0.06 }}
                viewport={{ once: true }}
                className="rounded-xl border border-foreground/5 bg-foreground/[0.02] p-5 text-center"
              >
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-xs text-foreground/30">{item.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-foreground/5 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <motion.div {...fadeUp} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-foreground">
              Envie de voir par vous-même ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-foreground/40">
              Gratuit, sans engagement. Rejoignez une communauté et lancez votre
              premier projet en quelques minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/inscription"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a92940] to-[#d8699e] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#a92940]/25 transition-all hover:shadow-[#a92940]/40 hover:brightness-110"
              >
                Créer un compte
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/choix-communaute"
                className="inline-flex items-center gap-2 rounded-xl border border-foreground/10 bg-foreground/5 px-7 py-3 text-sm font-medium text-foreground/60 backdrop-blur-sm transition-all hover:border-foreground/20 hover:bg-foreground/10 hover:text-foreground"
              >
                Explorer les communautés
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PiedPage />
    </div>
  );
}
