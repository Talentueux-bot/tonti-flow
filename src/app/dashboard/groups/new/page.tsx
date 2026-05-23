"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Calendar, DollarSign, MessageCircle, Check } from "lucide-react";

const frequencies = [
  { value: "weekly", label: "Hebdomadaire" },
  { value: "biweekly", label: "Bimensuel" },
  { value: "monthly", label: "Mensuel" },
];

const steps = [
  { id: 1, label: "Informations" },
  { id: 2, label: "Règles" },
  { id: 3, label: "Membres" },
];

export default function NewGroupPage() {
  const [step, setStep] = useState(1);
  const [frequency, setFrequency] = useState("monthly");

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/groups"
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Créer une tontine</h1>
          <p className="text-sm text-gray-500">Configurez votre groupe en 3 étapes</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s.id < step ? "gradient-emerald text-white" :
                s.id === step ? "bg-emerald-600 text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                s.id <= step ? "text-emerald-600" : "text-gray-400"
              }`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${s.id < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">

        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Informations générales
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de la tontine</label>
                  <input
                    type="text"
                    placeholder="Ex: Famille Kouyaté, Commerçantes HLM..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
                  <textarea
                    rows={3}
                    placeholder="Décrivez votre groupe..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant / cotisation</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="30 000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">FCFA</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de membres</label>
                    <input
                      type="number"
                      placeholder="10"
                      min={2}
                      max={50}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Règles de la tontine
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
                <div className="grid grid-cols-3 gap-3">
                  {frequencies.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFrequency(f.value)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        frequency === f.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de début</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ordre de rotation</label>
                <div className="space-y-2">
                  {["Tirage au sort automatique", "Ordre défini manuellement"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-400 transition-colors">
                      <input type="radio" name="rotation" className="text-emerald-600" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">Rappels WhatsApp automatiques</p>
                  <p className="text-xs text-gray-400 mt-0.5">Rappel 3 jours avant l&apos;échéance</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-emerald-500 flex items-center justify-end pr-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Inviter les membres
            </h2>

            <div className="p-4 rounded-2xl gradient-dark text-white">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-green-400" fill="currentColor" />
                <span className="text-sm font-semibold">Inviter via WhatsApp</span>
              </div>
              <p className="text-emerald-200 text-sm mb-3">
                Partagez le lien d&apos;invitation sur votre groupe WhatsApp.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://tontiflow.app/join/ABC123"
                  readOnly
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/20"
                />
                <button className="px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors">
                  Copier
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ajouter par numéro</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+221 77 000 00 00"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button className="px-4 py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90">
                  Ajouter
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">Bon à savoir :</span> Les membres recevront une invitation WhatsApp et pourront rejoindre en un clic. Aucune installation requise.
              </p>
            </div>
          </>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : null}
            className="flex-1 py-3 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
          >
            {step === 3 ? "Créer la tontine 🚀" : "Continuer"}
            {step < 3 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
