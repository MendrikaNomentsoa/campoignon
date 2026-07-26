"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Communautés", href: "/choix-communaute" },
  { label: "À propos", href: "/a-propos" },
];

export function BarreNavigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0204]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Campoignon"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-base font-bold tracking-tight text-white">
            Campoignon
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/connexion"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#a92940] to-[#d8699e] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#a92940]/20 transition-all hover:shadow-[#a92940]/35 hover:brightness-110"
          >
            S&apos;inscrire
            <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-white/5" />
              <Link
                href="/connexion"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg bg-gradient-to-r from-[#a92940] to-[#d8699e] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[#a92940]/20"
              >
                S&apos;inscrire
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
