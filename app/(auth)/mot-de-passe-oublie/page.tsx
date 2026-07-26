"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ArrowRight, Check, ArrowLeft } from "lucide-react"
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

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)

  const phrases = [
    "Pas de panique, on retrouve ton accès ensemble.",
    "Un email, un clic, et tu es de retour.",
    "Même les meilleurs devs oublient leur mot de passe.",
    "Ta progression n'est pas perdue, on la garde pour toi.",
    "Respire. Tout va bien. Le lien arrive bientôt.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [phrases.length])

  const letterDelays = [0.4, 1.0, 0.2, 1.3, 0.0, 0.6, 1.2, 0.4, 0.8, 0.5]

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

      {/* Right side — forgot password form */}
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
                {sent ? "Email envoyé !" : "Mot de passe oublié ?"}
              </CardTitle>
              <CardDescription className="text-black/60">
                {sent
                  ? "Vérifie ta boîte de réception et suis le lien pour réinitialiser ton mot de passe."
                  : "Pas de souci, entre ton email et on t'envoie un lien pour réinitialiser ton mot de passe."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {!sent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSent(true)
                  }}
                  className="space-y-4"
                >
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
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 placeholder:text-black/40"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full">
                    Send reset link
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Success state */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex size-16 items-center justify-center rounded-full bg-[#a92940]/10">
                      <Mail className="size-8 text-[#a92940]" />
                    </div>
                    <p className="text-center text-sm text-black/60">
                      Un email de réinitialisation a été envoyé à{" "}
                      <span className="font-medium text-black">{email}</span>.
                      Tu as 30 minutes pour cliquer sur le lien.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-black"
                    onClick={() => setSent(false)}
                  >
                    Renvoyer l&apos;email
                  </Button>
                </div>
              )}

              {/* Back to login */}
              <Link
                href="/connexion"
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-black/60 transition-colors hover:text-black"
              >
                <ArrowLeft className="size-4" />
                Retour à la connexion
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
