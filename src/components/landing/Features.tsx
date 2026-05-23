import {
  Smartphone,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  BarChart3,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Mobile Money intégré",
    description:
      "Payez et recevez vos cotisations via Orange Money, Wave, MTN Money et cartes bancaires. Zéro friction.",
    color: "bg-orange-50 text-orange-600",
    border: "border-orange-100",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-first",
    description:
      "Invitez vos membres, envoyez des rappels automatiques et recevez des confirmations directement sur WhatsApp.",
    color: "bg-green-50 text-green-600",
    border: "border-green-100",
  },
  {
    icon: RefreshCw,
    title: "Rotation automatique",
    description:
      "L'ordre des bénéficiaires est géré automatiquement. Transparent, équitable et traçable pour tous.",
    color: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-100",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité bancaire",
    description:
      "Chiffrement SSL, authentification sécurisée et historique immuable de toutes les transactions.",
    color: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord complet",
    description:
      "Suivez en temps réel la progression de votre tontine, les paiements en attente et l'historique.",
    color: "bg-purple-50 text-purple-600",
    border: "border-purple-100",
  },
  {
    icon: Clock,
    title: "Rappels automatiques",
    description:
      "Plus besoin de courir après les membres. TontiFlow envoie des rappels automatiques avant chaque échéance.",
    color: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Tout ce dont vous avez besoin,{" "}
            <span className="text-emerald-600">rien de plus</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            TontiFlow est conçu pour être simple à utiliser, même sans
            expérience financière.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`bg-white rounded-2xl p-6 border ${f.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
