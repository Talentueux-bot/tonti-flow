"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ChevronRight, Clock, RefreshCw } from "lucide-react";
import { getMyProfile } from "@/lib/db";

export default function VerificationBanner() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getMyProfile()
      .then((p) => setStatus(p?.verification_status ?? "unverified"))
      .catch(() => setStatus(null));
  }, []);

  if (status === null || status === "approved") return null;

  // Vérification en cours
  if (status === "pending") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <Clock className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900">Vérification en cours</p>
          <p className="text-xs text-blue-700 mt-0.5">Vos informations sont en cours de validation. Vous recevrez la réponse par email sous quelques minutes.</p>
        </div>
      </div>
    );
  }

  // Refusée
  if (status === "rejected") {
    return (
      <Link
        href="/dashboard/profile"
        className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 hover:bg-red-100 transition-colors"
      >
        <RefreshCw className="w-5 h-5 text-red-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">Vérification refusée</p>
          <p className="text-xs text-red-600 mt-0.5">Renvoyez une photo nette de votre pièce d&apos;identité pour valider votre compte.</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold">
          Renvoyer <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </Link>
    );
  }

  // Non vérifié (compte récemment créé) → incitation forte à agir immédiatement
  return (
    <Link
      href="/dashboard/profile"
      className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 hover:bg-orange-100 transition-colors"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-xl bg-orange-300 opacity-50 animate-ping" />
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
          <ShieldAlert className="w-5 h-5 text-orange-600" />
        </span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-orange-900">Vérifiez votre identité maintenant</p>
        <p className="text-xs text-orange-700 mt-0.5">
          Cliquez immédiatement pour valider vos informations et débloquer toutes les fonctionnalités (cotiser, recevoir vos gains).
        </p>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-xl gradient-emerald text-white text-xs font-semibold">
        Vérifier <ChevronRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
