"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Zap, Star } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/plans";
import { startPawapayCheckout } from "@/lib/checkout";

const paidPlans: { id: PlanId; tagline: string; features: string[]; highlight: boolean }[] = [
  {
    id: "pro",
    tagline: "Pour les associations et les commerçants actifs.",
    features: [
      "Groupes illimités",
      "Membres illimités",
      "Rappels WhatsApp illimités",
      "Historique complet",
      "Rapports et statistiques",
      "Support prioritaire",
    ],
    highlight: true,
  },
  {
    id: "diaspora",
    tagline: "Conçu pour les transferts Europe ↔ Afrique.",
    features: [
      "Tout le plan Pro",
      "Paiements par carte bancaire",
      "Transferts diaspora",
      "Multi-devises (EUR, USD, FCFA)",
      "Assistant IA financier",
      "Gestionnaire de compte dédié",
    ],
    highlight: false,
  },
];

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  const subscribe = async (plan: PlanId) => {
    setLoadingPlan(plan);
    try {
      await startPawapayCheckout({ purpose: "subscription", plan });
    } catch (e) {
      toast.error((e as Error).message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passer à un plan supérieur</h1>
          <p className="text-gray-500 mt-0.5">7 jours d&apos;essai gratuit, sans engagement.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {paidPlans.map((p) => {
          const plan = PLANS[p.id];
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl p-6 flex flex-col ${
                p.highlight ? "gradient-dark text-white shadow-xl" : "bg-white border border-gray-100"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400 text-emerald-900 text-[11px] font-bold">
                  <Star className="w-3 h-3" fill="currentColor" /> Le plus populaire
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                {p.highlight && <Zap className="w-4 h-4 text-emerald-400" fill="currentColor" />}
                <h2 className={`text-lg font-bold ${p.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h2>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-3xl font-bold ${p.highlight ? "text-white" : "text-gray-900"}`}>
                  {new Intl.NumberFormat("fr-FR").format(plan.amount)}
                </span>
                <span className={`text-sm pb-1 ${p.highlight ? "text-emerald-300" : "text-gray-400"}`}>FCFA/mois</span>
              </div>
              <p className={`text-sm mb-4 ${p.highlight ? "text-emerald-200" : "text-gray-500"}`}>{p.tagline}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${p.highlight ? "bg-emerald-500/30" : "bg-emerald-100"}`}>
                      <Check className={`w-3 h-3 ${p.highlight ? "text-emerald-300" : "text-emerald-600"}`} />
                    </div>
                    <span className={`text-sm ${p.highlight ? "text-emerald-100" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(p.id)}
                disabled={loadingPlan !== null}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center ${
                  p.highlight
                    ? "bg-white text-emerald-700 hover:bg-emerald-50"
                    : "gradient-emerald text-white hover:opacity-90 shadow-md shadow-emerald-200"
                }`}
              >
                {loadingPlan === p.id
                  ? <span className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                  : "Démarrer l'essai gratuit (7 jours)"}
              </button>
              <p className={`text-center text-[11px] mt-2 ${p.highlight ? "text-emerald-300" : "text-gray-400"}`}>
                Puis {new Intl.NumberFormat("fr-FR").format(plan.amount)} FCFA/mois · annulable à tout moment
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
