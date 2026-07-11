"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Download, Share, Zap, ChevronDown } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(true); // par défaut caché tant qu'on ne sait pas
  const [hidden, setHidden] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }
    setInstalled(false);

    const ua = navigator.userAgent;
    setPlatform(/iphone|ipad|ipod/i.test(ua) ? "ios" : /android/i.test(ua) ? "android" : "other");

    const handler = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Réapparaît à chaque changement de page.
  useEffect(() => { setHidden(false); setShowHelp(false); }, [pathname]);

  if (installed || hidden) return null;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => {});
      setDeferred(null);
      return;
    }
    setShowHelp((v) => !v);
  };

  const help =
    platform === "ios"
      ? "Appuyez sur Partager (carré + flèche ↑) en bas de Safari, puis « Sur l'écran d'accueil »."
      : platform === "android"
      ? "Ouvrez le menu ⋮ de Chrome, puis « Installer l'application » (ou « Ajouter à l'écran d'accueil »)."
      : "Ouvrez le menu de votre navigateur, puis « Installer l'application ».";

  return (
    <div className="fixed z-[60] bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">Installer l&apos;application</p>
            <p className="text-[11px] text-gray-400">Accès rapide, plein écran</p>
          </div>
          <button
            onClick={onClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-emerald text-white text-xs font-semibold hover:opacity-90 shrink-0"
          >
            {deferred ? <Download className="w-3.5 h-3.5" /> : platform === "ios" ? <Share className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Installer
          </button>
          <button onClick={() => setHidden(true)} className="p-1 rounded-lg hover:bg-gray-100 shrink-0" title="Masquer">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        {showHelp && (
          <div className="px-4 pb-3 -mt-1">
            <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3">{help}</p>
          </div>
        )}
      </div>
    </div>
  );
}
