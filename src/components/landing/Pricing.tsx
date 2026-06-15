import Link from "next/link";
import { Check, Zap, Star } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    currency: "FCFA",
    period: "/mois",
    description: "Parfait pour démarrer et tester TontiFlow.",
    features: [
      "3 groupes tontine max",
      "Jusqu'à 10 membres / groupe",
      "10 rappels WhatsApp / mois",
      "Tableau de bord basique",
      "Historique 3 mois",
    ],
    cta: "Commencer gratuitement",
    href: "/auth/register",
    ctaStyle: "border border-gray-200 text-gray-800 hover:border-emerald-500 hover:text-emerald-600",
    popular: false,
  },
  {
    name: "Pro",
    price: "7 500",
    currency: "FCFA",
    period: "/mois",
    description: "Pour les associations et les commerçants actifs.",
    features: [
      "Groupes illimités",
      "Membres illimités",
      "Rappels WhatsApp illimités",
      "Rotation automatique avancée",
      "Historique complet",
      "Rapports et statistiques",
      "Support prioritaire",
    ],
    cta: "Essai gratuit 7 jours",
    href: "/auth/register?plan=pro",
    ctaStyle: "text-white gradient-emerald shadow-lg shadow-emerald-200 hover:opacity-90",
    popular: true,
  },
  {
    name: "Diaspora",
    price: "13 000",
    currency: "FCFA",
    period: "/mois",
    description: "Conçu pour les transferts Europe ↔ Afrique.",
    features: [
      "Tout le plan Pro",
      "Paiements par carte bancaire",
      "Transferts diaspora",
      "Multi-devises (EUR, USD, FCFA)",
      "Assistant IA financier",
      "Score de confiance membres",
      "Gestionnaire de compte dédié",
    ],
    cta: "Essai gratuit 7 jours",
    href: "/auth/register?plan=diaspora",
    ctaStyle: "text-white gradient-emerald shadow-md shadow-emerald-200 hover:opacity-90",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Des prix <span className="text-emerald-600">accessibles</span> à tous
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "gradient-dark text-white shadow-2xl shadow-emerald-900/30 scale-105"
                  : "bg-white border border-gray-100 hover:shadow-md transition-shadow"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-400 text-emerald-900 text-xs font-bold shadow-md">
                    <Star className="w-3 h-3" fill="currentColor" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.popular && (
                    <Zap className="w-4 h-4 text-emerald-400" fill="currentColor" />
                  )}
                  <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                </div>
                <div className="flex items-end gap-1 mt-3">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm pb-1.5 ${plan.popular ? "text-emerald-300" : "text-gray-400"}`}>
                    {plan.currency}{plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? "text-emerald-200" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.popular ? "bg-emerald-500/30" : "bg-emerald-100"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-emerald-300" : "text-emerald-600"}`} />
                    </div>
                    <span className={`text-sm ${plan.popular ? "text-emerald-100" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          Les commissions de transaction (100–500 FCFA) s&apos;appliquent uniquement sur les paiements Mobile Money.
          <br />
          Aucun frais caché.
        </p>
      </div>
    </section>
  );
}
