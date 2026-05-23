import Image from "next/image";
import { UserPlus, MessageCircle, CreditCard, Banknote } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Créez votre groupe",
    description:
      "Donnez un nom à votre tontine, choisissez le montant de la cotisation, la fréquence et le nombre de membres.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Invitez via WhatsApp",
    description:
      "Envoyez des invitations directement sur WhatsApp. Vos proches rejoignent en un clic, sans création de compte compliquée.",
    color: "from-green-400 to-green-600",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Collectez les cotisations",
    description:
      "Chaque membre paie via Orange Money, Wave ou MTN Money. Les confirmations sont automatiques et instantanées.",
    color: "from-teal-400 to-teal-600",
  },
  {
    number: "04",
    icon: Banknote,
    title: "Versement automatique",
    description:
      "Le bénéficiaire du mois reçoit le pot directement sur son Mobile Money. L'ordre tourne automatiquement.",
    color: "from-cyan-400 to-cyan-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Lancez votre tontine en{" "}
            <span className="text-emerald-600">4 étapes</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Simple, rapide et accessible depuis votre téléphone.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Step icon */}
                <div
                  className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-5`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 text-xs font-bold text-emerald-600 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Screenshot mockup */}
        <div className="mt-16 relative max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100 border border-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
            alt="Personnes utilisant TontiFlow sur mobile"
            width={1200}
            height={500}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent flex items-end p-8">
            <div className="text-white">
              <p className="text-sm font-medium text-emerald-300 mb-1">Disponible partout en Afrique</p>
              <p className="text-xl font-bold">Gérez votre tontine depuis votre téléphone</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200 text-base"
          >
            Démarrer maintenant — C&apos;est gratuit
          </a>
          <p className="mt-3 text-sm text-gray-400">
            Aucune carte bancaire requise · Prêt en 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
}
