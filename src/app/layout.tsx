import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import PWARegister from "@/components/PWARegister";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TontiFlow — Votre tontine africaine automatisée",
  description:
    "Créez, gérez et automatisez vos tontines facilement avec Mobile Money, WhatsApp et une sécurité de niveau bancaire.",
  manifest: "/manifest.webmanifest",
  applicationName: "TontiFlow",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "TontiFlow" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <PWARegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
