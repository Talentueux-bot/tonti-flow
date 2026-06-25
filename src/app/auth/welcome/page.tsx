"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Zap, MailCheck, ArrowRight } from "lucide-react";

function WelcomeInner() {
  const email = useSearchParams().get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-md w-full p-8 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Tonti<span className="text-emerald-600">Flow</span></span>
        </Link>

        <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <MailCheck className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre inscription ! 🎉</h1>
        <p className="text-gray-500 text-sm mb-6">
          Votre compte TontiFlow a bien été créé. Une dernière étape pour l&apos;activer :
        </p>

        {/* Instructions */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <p className="text-sm text-gray-700">
              Ouvrez votre boîte mail{email ? <> (<strong>{email}</strong>)</> : null}.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <p className="text-sm text-gray-700">
              <strong>Cliquez sur le lien d&apos;activation</strong> que nous venons de vous envoyer.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <p className="text-sm text-gray-700">Revenez ensuite vous connecter à votre compte.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Vous n&apos;avez rien reçu ? Vérifiez vos <strong>spams</strong> ou patientez quelques minutes.
        </p>

        {/* Se connecter */}
        <Link
          href="/auth/login"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Se connecter <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="mt-4 text-xs text-gray-400">
          Mauvaise adresse ?{" "}
          <Link href="/auth/register" className="text-emerald-600 font-medium hover:underline">
            Créer un autre compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>}>
      <WelcomeInner />
    </Suspense>
  );
}
