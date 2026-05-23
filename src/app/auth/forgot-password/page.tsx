"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Tonti<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
              <p className="text-gray-500 text-sm mb-8">
                Entrez votre email ou numéro de téléphone. Nous vous enverrons un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email ou téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Envoyer le lien <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-gray-500 text-sm mb-6">
                Vérifiez votre boîte mail. Le lien expire dans 30 minutes.
              </p>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 mb-6">
                Vous n&apos;avez pas reçu l&apos;email ?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold hover:underline"
                >
                  Renvoyer
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
