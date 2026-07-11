"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Zap } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    if (localStorage.getItem("tf_install_dismissed") === "1") return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setShow(false);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("tf_install_dismissed", "1");
  };

  return (
    <div className="fixed z-[60] bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Installer TontiFlow</p>
          {isIOS ? (
            <p className="text-xs text-gray-500 mt-0.5">
              Appuyez sur <Share className="inline w-3.5 h-3.5 -mt-0.5" /> <strong>Partager</strong>, puis{" "}
              <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mt-0.5">Accès rapide, plein écran, comme une vraie app.</p>
              <button
                onClick={install}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-emerald text-white text-xs font-semibold hover:opacity-90"
              >
                <Download className="w-3.5 h-3.5" /> Installer
              </button>
            </>
          )}
        </div>
        <button onClick={dismiss} className="p-1 rounded-lg hover:bg-gray-100 shrink-0" title="Fermer">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
