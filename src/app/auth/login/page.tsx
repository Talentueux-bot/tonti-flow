"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Zap, ArrowRight, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast.error(
          error.message === "Invalid login credentials"
            ? "Email ou mot de passe incorrect."
            : error.message
        );
        return;
      }
      toast.success("Connexion réussie 👋");
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/dashboard");
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Tonti<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
        </div>

        <div className="max-w-sm w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bon retour 👋</h1>
          <p className="text-gray-500 mb-8">Connectez-vous à votre compte TontiFlow</p>

          {/* WhatsApp quick login */}
          <button
            type="button"
            onClick={() => toast("Connexion WhatsApp bientôt disponible 🚀", { icon: "💬" })}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors mb-6"
          >
            <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Continuer avec WhatsApp</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou par email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email ou téléphone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-emerald-600 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Visual */}
      <div className="hidden lg:flex flex-1 gradient-dark flex-col justify-between p-12">
        <div />
        <div className="space-y-6">
          <div className="text-white">
            <p className="text-4xl font-bold leading-tight mb-4">
              Gérez vos tontines<br />en toute sérénité.
            </p>
            <p className="text-emerald-200 text-lg">
              Rejoignez 12 000+ utilisateurs qui font confiance à TontiFlow.
            </p>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "250K+", label: "Tontines créées" },
              { value: "2.4 Mds", label: "FCFA gérés" },
              { value: "98%", label: "Taux de satisfaction" },
              { value: "4.9/5", label: "Note utilisateurs" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-emerald-300 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-emerald-400 text-sm">© 2026 TontiFlow · Sécurisé SSL</p>
      </div>
    </div>
  );
}
