"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Smartphone, Globe, Trash2, ChevronRight, MessageCircle, Moon, Plus, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { getPlan, getReminderUsage, getUserGroupCount, PLANS } from "@/lib/plans";

type PaymentMethod = {
  id: string;
  type: string;
  label: string;
  number: string;
  isDefault: boolean;
};

const PLATFORM_BG: Record<string, string> = {
  wave: "bg-blue-500",
  orange: "bg-orange-500",
  mtn: "bg-yellow-500",
  free: "bg-red-500",
  visa: "bg-indigo-600",
  mastercard: "bg-rose-600",
};

const PLATFORM_LOGO: Record<string, string> = {
  wave: "W", orange: "O", mtn: "M", free: "F", visa: "V", mastercard: "MC",
};

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full flex items-center transition-all shrink-0 ${on ? "gradient-emerald justify-end pr-0.5" : "bg-gray-200 justify-start pl-0.5"}`}
    >
      <div className="w-5 h-5 rounded-full bg-white shadow" />
    </button>
  );
}

const sections = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Rappels de cotisation", desc: "Recevoir un rappel avant l'échéance", defaultOn: true },
      { label: "Confirmation de paiement", desc: "Notification après chaque paiement", defaultOn: true },
      { label: "Nouveau bénéficiaire", desc: "Quand le tour d'un membre arrive", defaultOn: true },
      { label: "Nouveaux membres", desc: "Quand quelqu'un rejoint votre tontine", defaultOn: false },
    ],
  },
  {
    title: "Canal de notification",
    icon: MessageCircle,
    items: [
      { label: "WhatsApp", desc: "Rappels et confirmations via WhatsApp", defaultOn: true },
      { label: "Email", desc: "Résumés hebdomadaires par email", defaultOn: true },
      { label: "Notifications push", desc: "Alertes sur votre téléphone", defaultOn: false },
    ],
  },
  {
    title: "Apparence",
    icon: Moon,
    items: [
      { label: "Mode sombre", desc: "Interface en thème sombre", defaultOn: false },
    ],
  },
];

export default function SettingsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("tontiflow_payment_methods");
    if (stored) setMethods(JSON.parse(stored));
  }, []);

  const setDefault = (id: string) => {
    const updated = methods.map((m) => ({ ...m, isDefault: m.id === id }));
    setMethods(updated);
    localStorage.setItem("tontiflow_payment_methods", JSON.stringify(updated));
  };

  return (
    <div className="space-y-7 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-0.5">Personnalisez votre expérience TontiFlow</p>
      </div>

      {/* Notification + Appearance toggles */}
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
            <section.icon className="w-4 h-4 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">{section.title}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <Toggle defaultOn={item.defaultOn} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Sécurité</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: "Changer le mot de passe", desc: "Dernière modification il y a 3 mois" },
            { label: "Authentification à 2 facteurs", desc: "Activée via SMS" },
            { label: "Sessions actives", desc: "2 appareils connectés" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Language + Country */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Région & Langue</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              <option>Français</option>
              <option>English</option>
              <option>Wolof</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Devise</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white">
              <option>FCFA (XOF)</option>
              <option>EUR (€)</option>
              <option>USD ($)</option>
              <option>GHS (₵)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Money */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Moyens de paiement</h2>
          </div>
          <Link href="/dashboard/payments" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            Gérer <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-6 space-y-3">
          {methods.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">Aucun moyen de paiement configuré.</p>
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Ajouter un moyen de paiement
              </Link>
            </div>
          ) : (
            <>
              {methods.map((m) => (
                <label
                  key={m.id}
                  onClick={() => setDefault(m.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    m.isDefault ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${PLATFORM_BG[m.type] ?? "bg-gray-400"} text-white text-xs font-bold flex items-center justify-center`}>
                      {PLATFORM_LOGO[m.type] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-400">{m.number.slice(0, 4)}••••{m.number.slice(-2)}</p>
                    </div>
                  </div>
                  {m.isDefault && <span className="text-xs text-emerald-600 font-semibold">Défaut</span>}
                </label>
              ))}
              <Link
                href="/dashboard/payments"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un moyen de paiement
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-red-50">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-red-600">Zone de danger</h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Supprimer mon compte</p>
              <p className="text-xs text-gray-500 mt-0.5">Cette action est irréversible. Toutes vos données seront supprimées.</p>
            </div>
            <button className="shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="px-8 py-3 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 transition-opacity text-sm shadow-md shadow-emerald-200">
          Sauvegarder les paramètres
        </button>
      </div>
    </div>
  );
}
