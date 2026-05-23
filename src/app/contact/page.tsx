"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail, MessageCircle, Phone, MapPin, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar simple */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Tonti<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Contact
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            On est là pour vous aider
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Une question, un problème, ou vous souhaitez en savoir plus sur le plan Diaspora ?
            Notre équipe répond sous 24h.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              {
                icon: Mail,
                title: "Email",
                value: "support@tontiflow.com",
                sub: "Réponse sous 24h",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp",
                value: "+221 77 000 00 00",
                sub: "Lun–Ven, 8h–20h",
              },
              {
                icon: Phone,
                title: "Téléphone",
                value: "+221 33 000 00 00",
                sub: "Lun–Ven, 9h–18h",
              },
              {
                icon: MapPin,
                title: "Adresse",
                value: "Dakar, Sénégal",
                sub: "& Paris, France",
              },
            ].map(({ icon: Icon, title, value, sub }) => (
              <div key={title} className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-gray-700 text-sm mt-0.5">{value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            {/* FAQ shortcut */}
            <div className="mt-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="font-semibold text-emerald-900 mb-1">Consultez notre FAQ</p>
              <p className="text-sm text-emerald-700 mb-3">
                La plupart des questions ont déjà une réponse dans notre FAQ.
              </p>
              <Link
                href="/#faq"
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
              >
                Voir la FAQ →
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h2>
                <p className="text-gray-500 max-w-sm">
                  Merci de nous avoir contacté. Notre équipe vous répondra dans les 24 heures.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 px-6 py-3 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                      <input
                        type="text"
                        placeholder="Aminata"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                      <input
                        type="text"
                        placeholder="Kouyaté"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      <option value="">Choisissez un sujet</option>
                      <option>Question sur un abonnement</option>
                      <option>Plan Diaspora — transferts</option>
                      <option>Problème technique</option>
                      <option>Remboursement / facturation</option>
                      <option>Partenariat</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Décrivez votre question en détail..."
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
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
                      <>
                        Envoyer le message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
