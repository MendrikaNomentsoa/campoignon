import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campoignon",
  description: "Plateforme de communautés et de projets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-[#0c0204] text-white">{children}</body>
    </html>
  );
}
