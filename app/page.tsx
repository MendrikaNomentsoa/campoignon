"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  Rocket,
  BookOpen,
  Brain,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { BarreNavigation } from "@/components/navigation/BarreNavigation";
import { PiedPage } from "@/components/navigation/PiedPage";

const features = [
  {
    icon: Users,
    title: "Communautés vivantes",
    description:
      "Créez ou rejoignez des espaces collaboratifs. Publications, discussions en temps réel, classements — tout est là pour garder le lien.",
    gradient: "from-[#a92940] to-[#d8699e]",
  },
  {
    icon: Rocket,
    title: "Projets structurés",
    description:
      "Roadmaps auto-générées, suivi de progression, gestion de tâches. Chaque projet avance avec un vrai cap, pas au fil de l'eau.",
    gradient: "from-[#62121b] to-[#a92940]",
  },
  {
    icon: Brain,
    title: "Compagnon IA",
    description:
      "Un assistant bienveillant qui comprend vos blocages, propose des micro-objectifs et relance sans culpabiliser. Votre co-pilote quotidiennement.",
    gradient: "from-[#d8699e] to-[#f6dce9]",
  },
  {
    icon: BookOpen,
    title: "Mémoire collective",
    description:
      "Cartes d'héritage, journaux de progression, post-mortems. Ce que l'équipe apprend reste gravé pour les prochains.",
    gradient: "from-[#a92940] to-[#62121b]",
  },
];

const stats = [
  { value: "100%", label: "Gratuit" },
  { value: "IA", label: "Intégrée" },
  { value: "24/7", label: "Disponible" },
  { value: "∞", label: "Projets" },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BarreNavigation />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(169,41,64,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(98,18,27,0.2)_0%,transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 inline-flex"
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#a92940]/20 via-[#d8699e]/10 to-[#62121b]/20 blur-xl" />
                <Image
                  src="/logo.png"
                  alt="Campoignon"
                  width={100}
                  height={100}
                  className="relative h-20 w-20 rounded-2xl object-contain"
                  priority
                />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#a92940]/20 bg-[#a92940]/10 px-4 py-1.5 backdrop-blur-sm"
            >
              <Sparkles className="size-3.5 text-[#a92940] dark:text-[#d8699e]" />
              <span className="text-xs font-medium tracking-wide text-[#62121b]/80 dark:text-[#f6dce9]/80">
                Plateforme communautaire propulsée par l&apos;IA
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Vos projets méritent{" "}
              <span className="bg-gradient-to-r from-[#a92940] via-[#62121b] to-[#a92940] bg-clip-text text-transparent dark:from-[#d8699e] dark:via-[#f6dce9] dark:to-[#d8699e]">
                une communauté
              </span>{" "}
              qui avance
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-foreground/50"
            >
              Campoignon rassemble vos équipes, structure vos projets et
              accompagne chaque pas — avec un compagnon IA qui relance sans
              culpabiliser.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/inscription"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a92940] to-[#d8699e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#a92940]/25 transition-all duration-300 hover:shadow-[#a92940]/40 hover:brightness-110"
              >
                Commencer gratuitement
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* STATS BAR */}
      <section className="relative z-10 -mt-8">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/5 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-background/80 px-6 py-5 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-foreground/40">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
              Fonctionnalités
            </p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Tout ce qu&apos;il faut, rien de trop
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-foreground/40">
              Une plateforme pensée pour les équipes qui veulent avancer
              sans friction.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...fadeUp}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-8 transition-all duration-500 hover:border-[#a92940]/20 hover:bg-foreground/[0.04]"
                >
                  <div
                    className={`absolute -top-24 -right-24 size-48 rounded-full bg-gradient-to-br ${feature.gradient} opacity-[0.07] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.12]`}
                  />
                  <div className="relative z-10">
                    <div
                      className={`mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <Icon className="size-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-foreground/45">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative border-t border-foreground/5 py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#a92940]">
              Comment ça marche
            </p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              De l&apos;inscription à l&apos;action, en trois étapes
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Rejoignez",
                desc: "Créez votre compte en 30 secondes et choisissez une communauté qui vous parle.",
                icon: Users,
              },
              {
                step: "02",
                title: "Lancez",
                desc: "Créez un projet, laissez le Compagnon IA générer votre roadmap et vos premières ressources.",
                icon: Rocket,
              },
              {
                step: "03",
                title: "Avancez",
                desc: "Suivez votre progression, recevez des relances bienveillantes, et capitalisez sur chaque pas.",
                icon: Zap,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  {...fadeUp}
                  transition={{ delay: 0.15 + i * 0.12 }}
                  viewport={{ once: true }}
                  className="relative text-center"
                >
                  <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl border border-[#a92940]/20 bg-[#a92940]/10">
                    <Icon className="size-6 text-[#a92940] dark:text-[#d8699e]" />
                  </div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#a92940]/60">
                    Étape {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/40">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-[#a92940]/20 bg-gradient-to-br from-[#1a0810] via-[#2a0d18] to-[#1a0810] p-12 text-center"
          >
            <div className="absolute -top-32 -right-32 size-64 rounded-full bg-[#a92940]/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 size-64 rounded-full bg-[#62121b]/20 blur-3xl" />

            <div className="relative z-10">
              <Image
                src="/logo.png"
                alt="Campoignon"
                width={56}
                height={56}
                className="mx-auto mb-6 h-14 w-14 object-contain"
              />
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Prêt à rejoindre l&apos;aventure ?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/45">
                Votre première communauté vous attend. Gratuit, sans engagement,
                et avec un compagnon IA pour vous guider.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/inscription"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a92940] to-[#d8699e] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#a92940]/25 transition-all hover:shadow-[#a92940]/40 hover:brightness-110"
                >
                  Créer mon compte
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/connexion"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Déjà inscrit ? Se connecter
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PiedPage />
    </div>
  );
}
