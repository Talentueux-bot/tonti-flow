"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, MessageCircle, Check } from "lucide-react";

const countries = [
  { code: "SN", name: "Sénégal", dial: "+221" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225" },
  { code: "CM", name: "Cameroun", dial: "+237" },
  { code: "ML", name: "Mali", dial: "+223" },
  { code: "GN", name: "Guinée", dial: "+224" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "BJ", name: "Bénin", dial: "+229" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "BE", name: "Belgique", dial: "+32" },
];

const perks = [
  "Création de tontine en 2 minutes",
  "Rappels WhatsApp automatiques",
  "Mobile Money intégré",
  "Gratuit pour commencer",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Visual */}
      <div className="hidden lg:flex flex-1 gradient-dark flex-col justify-between p-12">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white">
            Tonti<span className="text-emerald-400">Flow</span>
          </span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-4xl font-bold text-white leading-tight mb-3">
              Commencez<br />gratuitement.
            </p>
            <p className="text-emerald-200 text-lg">
              Votre première tontine en moins de 2 minutes.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-emerald-100 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-emerald-400 text-sm">© 2026 TontiFlow · Aucune carte bancaire requise</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Tonti<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto lg:mx-0">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s <= step ? "gradient-emerald text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs font-medium ${s <= step ? "text-emerald-600" : "text-gray-400"}`}>
                  {s === 1 ? "Informations" : "Sécurité"}
                </span>
                {s < 2 && <div className={`w-8 h-0.5 mx-1 ${s < step ? "bg-emerald-400" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? "Créer un compte 🚀" : "Sécurisez votre compte 🔒"}
          </h1>
          <p className="text-gray-500 mb-8">
            {step === 1 ? "Rejoignez des milliers de familles africaines" : "Choisissez un mot de passe sécurisé"}
          </p>

          {step === 1 && (
            <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors mb-6">
              <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Continuer avec WhatsApp</span>
            </button>
          )}

          {step === 1 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou par email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                    <input
                      type="text"
                      placeholder="Aminata"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input
                      type="text"
                      placeholder="Kouyaté"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                  <div className="flex gap-2">
                    <select className="px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                      {countries.map((c) => (
                        <option key={c.code} value={c.dial}>{c.dial} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="77 000 00 00"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-emerald-500" : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Niveau : Moyen</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    J&apos;accepte les{" "}
                    <Link href="#" className="text-emerald-600 hover:underline">Conditions d&apos;utilisation</Link>{" "}
                    et la{" "}
                    <Link href="#" className="text-emerald-600 hover:underline">Politique de confidentialité</Link>
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1 ? "Continuer" : "Créer mon compte"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Retour
              </button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-emerald-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
