import Link from "next/link";
import { Check, Percent, ArrowRight } from "lucide-react";

const tiers = [
  { range: "1 000 – 20 000 FCFA", rate: "5%", example: "10 000 → 500 FCFA de frais" },
  { range: "20 001 – 100 000 FCFA", rate: "4%", example: "50 000 → 2 000 FCFA de frais" },
  { range: "Plus de 100 000 FCFA", rate: "3%", example: "200 000 → 6 000 FCFA de frais" },
];

const perks = [
  "Aucun abonnement, aucun frais fixe",
  "Tontines et membres illimités",
  "Rappels WhatsApp inclus",
  "Vous ne payez qu'un petit frais de service par dépôt",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Tarification simple
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Pas d&apos;abonnement. <span className="text-emerald-600">Juste un petit frais</span> par dépôt.
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            TontiFlow est gratuit à l&apos;usage : un frais de service transparent est prélevé uniquement sur les dépôts.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {tiers.map((t, i) => (
            <div
              key={t.range}
              className={`rounded-2xl p-7 border ${i === 1 ? "gradient-dark text-white shadow-xl" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${i === 1 ? "bg-white/10" : "bg-emerald-50"}`}>
                <Percent className={`w-5 h-5 ${i === 1 ? "text-emerald-300" : "text-emerald-600"}`} />
              </div>
              <p className={`text-4xl font-bold ${i === 1 ? "text-white" : "text-gray-900"}`}>{t.rate}</p>
              <p className={`text-sm mt-2 font-medium ${i === 1 ? "text-emerald-200" : "text-gray-700"}`}>{t.range}</p>
              <p className={`text-xs mt-3 ${i === 1 ? "text-emerald-300" : "text-gray-400"}`}>Ex. {t.example}</p>
            </div>
          ))}
        </div>

        {/* Perks + CTA */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <ul className="grid sm:grid-cols-2 gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-700">{p}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 shadow-md shadow-emerald-200"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Le frais de service est calculé automatiquement et affiché clairement avant chaque paiement.
        </p>
      </div>
    </section>
  );
}
