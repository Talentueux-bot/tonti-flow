"use client";

import { useState } from "react";
import { CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, CreditCard, Filter, Search, Download } from "lucide-react";
import Image from "next/image";

const tabs = ["Tous", "Cotisations", "Versements", "En attente"];

const transactions = [
  {
    id: "1",
    type: "paid",
    label: "Cotisation payée",
    group: "Famille Diallo",
    method: "Wave",
    amount: "-30 000",
    currency: "FCFA",
    date: "23 mai 2026",
    time: "10:24",
    status: "completed",
    avatar: "https://i.pravatar.cc/40?img=47",
  },
  {
    id: "2",
    type: "received",
    label: "Pot reçu — votre tour !",
    group: "Commerçantes HLM",
    method: "Orange Money",
    amount: "+400 000",
    currency: "FCFA",
    date: "30 mai 2026",
    time: "09:00",
    status: "upcoming",
    avatar: "https://i.pravatar.cc/40?img=56",
  },
  {
    id: "3",
    type: "paid",
    label: "Cotisation payée",
    group: "Diaspora Paris",
    method: "Carte Visa",
    amount: "-100",
    currency: "EUR",
    date: "20 mai 2026",
    time: "15:45",
    status: "completed",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
  {
    id: "4",
    type: "pending",
    label: "Cotisation en attente",
    group: "Famille Diallo",
    method: "—",
    amount: "-30 000",
    currency: "FCFA",
    date: "25 juin 2026",
    time: "Échéance",
    status: "pending",
    avatar: "https://i.pravatar.cc/40?img=47",
  },
  {
    id: "5",
    type: "paid",
    label: "Cotisation payée",
    group: "Famille Diallo",
    method: "Wave",
    amount: "-30 000",
    currency: "FCFA",
    date: "25 avril 2026",
    time: "11:30",
    status: "completed",
    avatar: "https://i.pravatar.cc/40?img=47",
  },
  {
    id: "6",
    type: "received",
    label: "Pot reçu",
    group: "Famille Diallo",
    method: "Orange Money",
    amount: "+360 000",
    currency: "FCFA",
    date: "25 avril 2026",
    time: "12:00",
    status: "completed",
    avatar: "https://i.pravatar.cc/40?img=47",
  },
];

const paymentMethods = [
  { name: "Wave", logo: "W", bg: "bg-blue-500", last4: "1234" },
  { name: "Orange Money", logo: "O", bg: "bg-orange-500", last4: "5678" },
  { name: "Visa •••• 4242", logo: "V", bg: "bg-indigo-600", last4: "4242" },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("Tous");

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500 mt-0.5">Historique de vos cotisations et versements</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-emerald-400 transition-colors">
          <Download className="w-4 h-4" />
          Exporter PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total cotisé", value: "190 000 FCFA", icon: ArrowUpRight, color: "text-red-500 bg-red-50", sub: "Ce mois" },
          { label: "Total reçu", value: "360 000 FCFA", icon: ArrowDownLeft, color: "text-emerald-600 bg-emerald-50", sub: "Ce mois" },
          { label: "En attente", value: "30 000 FCFA", icon: Clock, color: "text-orange-500 bg-orange-50", sub: "Avant le 25 juin" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`w-8 h-8 rounded-xl ${c.color} flex items-center justify-center mb-2`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
            <p className="text-[11px] text-gray-300 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Payment due banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Cotisation due — Famille Diallo</p>
            <p className="text-sm text-gray-500">30 000 FCFA · Échéance le 25 juin 2026</p>
          </div>
        </div>
        <button className="shrink-0 px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200">
          Payer maintenant
        </button>
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Moyens de paiement
          </h2>
          <button className="text-xs text-emerald-600 font-medium hover:underline">+ Ajouter</button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {paymentMethods.map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
              <div className={`w-7 h-7 rounded-lg ${m.bg} text-white text-xs font-bold flex items-center justify-center`}>
                {m.logo}
              </div>
              <span className="text-sm font-medium text-gray-700">{m.name}</span>
              <span className="text-xs text-gray-400">••{m.last4}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs + Search */}
        <div className="px-5 pt-4 space-y-4 border-b border-gray-50">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === t
                    ? "gradient-emerald text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pb-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-emerald-400">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-50">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="relative">
                <Image
                  src={t.avatar}
                  alt={t.group}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                  t.status === "completed" ? "bg-emerald-100" :
                  t.status === "pending" ? "bg-orange-100" : "bg-blue-100"
                }`}>
                  {t.status === "completed"
                    ? <CheckCircle className="w-3 h-3 text-emerald-600" />
                    : <Clock className="w-3 h-3 text-orange-500" />
                  }
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-400">{t.group} · {t.method}</p>
              </div>

              <div className="text-right">
                <p className={`text-sm font-bold ${
                  t.amount.startsWith("+") ? "text-emerald-600" :
                  t.status === "pending" ? "text-orange-500" : "text-gray-800"
                }`}>
                  {t.amount} {t.currency}
                </p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
