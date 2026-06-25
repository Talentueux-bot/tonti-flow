"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmedPage() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Si Supabase a établi une session via le lien, on propose d'aller au dashboard.
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md w-full p-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Tonti<span className="text-emerald-600">Flow</span></span>
        </Link>

        <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email confirmé ! ✅</h1>
        <p className="text-gray-500 text-sm mb-8">
          Votre adresse email a bien été vérifiée. Votre compte TontiFlow est maintenant actif —
          bienvenue parmi nous !
        </p>

        <Link
          href={hasSession ? "/dashboard" : "/auth/login"}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 transition-opacity"
        >
          {hasSession ? "Accéder à mon tableau de bord" : "Se connecter à TontiFlow"}
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link href="/" className="mt-4 inline-block text-xs text-gray-400 hover:text-gray-600">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
