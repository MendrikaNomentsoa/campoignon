import { Mail } from "lucide-react";

export default function VerificationEmailPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(169,41,64,0.12)_0%,transparent_50%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#a92940]/10">
          <Mail className="size-8 text-[#a92940] dark:text-[#d8699e]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Vérifie ton email</h1>
        <p className="max-w-sm text-sm text-foreground/50">
          On t&apos;a envoyé un lien de confirmation. Clique dessus pour activer ton compte et rejoindre la communauté.
        </p>
      </div>
    </main>
  );
}
