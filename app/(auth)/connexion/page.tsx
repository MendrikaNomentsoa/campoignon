"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const phrases = [
    "Content de te revoir.",
    "Tes projets t'attendent.",
    "La communauté a avancé pendant ton absence.",
    "Reprends là où tu t'étais arrêté.",
    "Chaque connexion te rapproche du prochain défi.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [phrases.length])

  const letterDelays = [0.3, 0.9, 0.1, 1.2, 0.0, 0.7, 1.4, 0.5, 1.1, 0.4]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Email ou mot de passe incorrect"
        )
        return
      }

      router.push("/onboarding")
    } catch {
      setError("Erreur réseau, réessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#62121b] via-[#a92940] to-[#62121b] p-12 lg:flex">
        <div className="absolute inset-0 opacity-20">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute top-0 left-0 h-32 w-full rotate-180"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="currentColor"
              className="text-white/10"
            />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mb-8 mx-auto w-fit"
          >
            <Image
              src="/logo.png"
              alt="Campoignon"
              width={200}
              height={60}
              className="h-auto w-auto max-w-[200px]"
              priority
            />
          </motion.div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white">
            {["C", "a", "m", "p", null, "g", "n", "i", "o", "n"].map(
              (char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: letterDelays[i],
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {char === null ? (
                    <Image
                      src="/logo.png"
                      alt="o"
                      width={36}
                      height={36}
                      className="mx-px inline-block align-middle"
                    />
                  ) : (
                    char
                  )}
                </motion.span>
              )
            )}
          </h1>
          <div className="h-20 overflow-hidden text-2xl text-zinc-300">
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIndex}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {phrases[phraseIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Right side — login form */}
      <div className="flex w-full items-center justify-center bg-[#f6dce9] p-6 sm:p-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only header */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[#a92940]">
              <Check className="size-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black">
              Campoignon
            </h1>
          </div>

          <Card className="border-white/30 bg-white shadow-[0_0_40px_rgba(169,41,64,0.25),0_0_80px_rgba(169,41,64,0.1)] backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-black">
                Content de te revoir
              </CardTitle>
              <CardDescription className="text-black/60">
                Connecte-toi pour retrouver tes communautés et tes projets
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 placeholder:text-black/40"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-black">
                      Mot de passe
                    </Label>
                    <Link
                      href="/mot-de-passe-oublie"
                      className="text-xs font-medium text-black/60 transition-colors hover:text-[#a92940]"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-black/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 placeholder:text-black/40"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-medium text-[#a92940]">{error}</p>
                )}

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion..." : "Se connecter"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-black/60">
                    ou continuer avec
                  </span>
                </div>
              </div>

              {/* Social login */}
              <Button
                variant="outline"
                type="button"
                className="w-full text-black"
                onClick={() => alert("Connexion Google bientôt disponible")}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuer avec Google
              </Button>

              {/* Sign up link */}
              <p className="text-center text-sm text-black/60">
                Pas encore de compte ?{" "}
                <Link
                  href="/inscription"
                  className="font-medium text-black transition-colors hover:text-[#a92940] hover:underline"
                >
                  S&apos;inscrire
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
