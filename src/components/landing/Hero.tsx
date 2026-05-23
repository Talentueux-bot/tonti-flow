"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Shield, CheckCircle, Users, TrendingUp } from "lucide-react";

const socialProofAvatars = [
  "https://i.pravatar.cc/40?img=47",
  "https://i.pravatar.cc/40?img=8",
  "https://i.pravatar.cc/40?img=44",
  "https://i.pravatar.cc/40?img=12",
  "https://i.pravatar.cc/40?img=56",
];

const stats = [
  { value: "10K+", label: "Utilisateurs actifs" },
  { value: "250K+", label: "Tontines créées" },
  { value: "98%", label: "Satisfaction" },
  { value: "4.9/5", label: "Notes utilisateurs" },
];

const badges = [
  { icon: Shield, text: "100% Sécurisé" },
  { icon: CheckCircle, text: "Conçu pour l'Afrique" },
  { icon: Users, text: "Support 24/7" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      {/* Background blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-50 opacity-80 blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-emerald-50 opacity-60 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left — Text ── */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Nouveau : Rappels WhatsApp automatiques
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-gray-900 leading-tight">
              Votre tontine africaine,{" "}
              <span className="text-emerald-600">automatisée</span> et{" "}
              <span className="text-emerald-600">sécurisée.</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
              Créez, gérez et automatisez vos tontines directement
              depuis votre téléphone et WhatsApp.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200 text-base"
              >
                Créer une tontine gratuitement
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-base"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 text-white" fill="white" />
                </div>
                Voir la démo
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {badges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon className="w-4 h-4 text-emerald-500" />
                  {text}
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {socialProofAvatars.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt="Utilisateur TontiFlow"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">+12 000</span> personnes nous font confiance
              </span>
            </div>
          </div>

          {/* ── Right — Photo + App card ── */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">

              {/* Background photo — African women using phone */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100 h-[480px] sm:h-[540px]">
                <Image
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85"
                  alt="Femmes africaines utilisant TontiFlow"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Soft overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-black/30" />
              </div>

              {/* App card — floating over photo */}
              <div className="absolute bottom-6 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Tontine active</p>
                    <p className="font-bold text-gray-900">Groupe Familial 🇸🇳</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    En cours
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Cagnotte actuelle</p>
                    <p className="text-2xl font-bold text-emerald-900">250 000 <span className="text-sm">FCFA</span></p>
                    <p className="text-xs text-emerald-600 mt-0.5">Prochain bénéficiaire : Aminata S.</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white gradient-emerald">
                    Voir détails
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex -space-x-1.5">
                    {["https://i.pravatar.cc/24?img=47","https://i.pravatar.cc/24?img=8","https://i.pravatar.cc/24?img=44","https://i.pravatar.cc/24?img=12"].map((src, i) => (
                      <Image key={i} src={src} alt="" width={24} height={24} className="w-6 h-6 rounded-full ring-2 ring-white object-cover" />
                    ))}
                    <span className="w-6 h-6 rounded-full ring-2 ring-white bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">+8</span>
                  </div>
                  <span>12/15 membres</span>
                  <span className="font-semibold text-gray-700">Prochain versement 25 Mai</span>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>Statut des cotisations</span>
                  <span className="text-emerald-600 font-semibold">83%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[83%] gradient-emerald rounded-full" />
                </div>

                <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white gradient-emerald">
                  Cotiser maintenant
                </button>
              </div>

              {/* WhatsApp notification */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 max-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">W</div>
                  <span className="text-xs font-semibold text-gray-800">TontiFlow</span>
                  <span className="text-[10px] text-gray-400 ml-auto">maintenant</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">
                  Rappel : N&apos;oubliez pas votre cotisation de 50 000 FCFA pour Groupe Familial.
                </p>
              </div>

              {/* Stat badge */}
              <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-gray-800">50 000 FCFA</p>
                  <p className="text-[10px] text-gray-400">Prochain versement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
