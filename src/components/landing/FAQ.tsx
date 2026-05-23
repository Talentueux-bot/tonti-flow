"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "TontiFlow est-il sécurisé ?",
    answer:
      "Oui. TontiFlow utilise un chiffrement SSL 256 bits, l'authentification à deux facteurs et des serveurs sécurisés. Toutes les transactions sont enregistrées et vérifiables. Votre argent ne transite jamais par nos serveurs — nous utilisons directement les API des opérateurs Mobile Money.",
  },
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "TontiFlow accepte Orange Money, Wave, MTN Money, Free Money, et les cartes bancaires Visa/Mastercard (pour la diaspora). D'autres opérateurs seront ajoutés selon les régions.",
  },
  {
    question: "Comment fonctionne WhatsApp avec TontiFlow ?",
    answer:
      "TontiFlow utilise l'API officielle WhatsApp Cloud de Meta. Vous recevez des rappels automatiques, des confirmations de paiement et des notifications de tour de bénéficiaire directement dans votre WhatsApp habituel.",
  },
  {
    question: "Que se passe-t-il si un membre ne paie pas ?",
    answer:
      "TontiFlow envoie des rappels automatiques (WhatsApp + email) avant l'échéance. En cas de retard, le gestionnaire du groupe est notifié. Vous pouvez configurer des pénalités ou exclure temporairement un membre en retard.",
  },
  {
    question: "Puis-je gérer plusieurs tontines en même temps ?",
    answer:
      "Oui ! Avec le plan Pro ou Diaspora, vous pouvez créer et gérer un nombre illimité de groupes. Avec le plan Gratuit, vous êtes limité à 1 groupe.",
  },
  {
    question: "Comment la rotation des bénéficiaires est-elle déterminée ?",
    answer:
      "Par défaut, l'ordre est tiré au sort lors de la création du groupe, visible par tous les membres. Vous pouvez aussi définir un ordre manuel si votre groupe le préfère. Tout est transparent et modifiable uniquement par le créateur du groupe.",
  },
  {
    question: "Puis-je utiliser TontiFlow depuis l'étranger ?",
    answer:
      "Absolument. Le plan Diaspora est spécialement conçu pour les Africains vivant en Europe, au Canada ou ailleurs. Vous payez votre cotisation par carte bancaire et vos proches en Afrique reçoivent en Mobile Money.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Non. L'abonnement mensuel est fixe et affiché clairement. La seule commission variable est de 100 à 500 FCFA par transaction Mobile Money, conforme aux frais des opérateurs. Aucune surprise.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Vous ne trouvez pas la réponse ?{" "}
            <a href="/contact" className="text-emerald-600 font-medium hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180 text-emerald-600" : ""
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
