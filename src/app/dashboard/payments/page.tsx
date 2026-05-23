"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle, Clock, ArrowUpRight, ArrowDownLeft, CreditCard,
  Filter, Search, Download, Plus, Trash2, X, Check,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import PaymentModal from "@/components/dashboard/PaymentModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string;
  type: "wave" | "orange" | "mtn" | "free" | "visa" | "mastercard";
  label: string;
  number: string;
  isDefault: boolean;
};

type Transaction = {
  id: string;
  type: "paid" | "received" | "pending";
  label: string;
  group: string;
  method: string;
  amount: string;
  currency: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "upcoming";
  avatar: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const PLATFORM_CATALOG = [
  { type: "wave" as const,       label: "Wave",         logo: "W",  bg: "bg-blue-500",    hint: "Numéro Wave" },
  { type: "orange" as const,     label: "Orange Money", logo: "O",  bg: "bg-orange-500",  hint: "Numéro Orange" },
  { type: "mtn" as const,        label: "MTN Money",    logo: "M",  bg: "bg-yellow-500",  hint: "Numéro MTN" },
  { type: "free" as const,       label: "Free Money",   logo: "F",  bg: "bg-red-500",     hint: "Numéro Free" },
  { type: "visa" as const,       label: "Carte Visa",   logo: "V",  bg: "bg-indigo-600",  hint: "Numéro de carte (16 chiffres)" },
  { type: "mastercard" as const, label: "Mastercard",   logo: "MC", bg: "bg-rose-600",    hint: "Numéro de carte (16 chiffres)" },
];

const defaultTransactions: Transaction[] = [
  { id: "1", type: "paid",     label: "Cotisation payée",       group: "Famille Diallo",     method: "Wave",         amount: "-30 000", currency: "FCFA", date: "23 mai 2026",   time: "10:24",    status: "completed", avatar: "https://i.pravatar.cc/40?img=47" },
  { id: "2", type: "received", label: "Pot reçu — votre tour!", group: "Commerçantes HLM",   method: "Orange Money", amount: "+400 000", currency: "FCFA", date: "30 mai 2026",   time: "09:00",    status: "upcoming",  avatar: "https://i.pravatar.cc/40?img=56" },
  { id: "3", type: "paid",     label: "Cotisation payée",       group: "Diaspora Paris",     method: "Carte Visa",   amount: "-100",     currency: "EUR",  date: "20 mai 2026",   time: "15:45",    status: "completed", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: "4", type: "pending",  label: "Cotisation en attente",  group: "Famille Diallo",     method: "—",            amount: "-30 000", currency: "FCFA", date: "25 juin 2026",  time: "Échéance", status: "pending",   avatar: "https://i.pravatar.cc/40?img=47" },
  { id: "5", type: "paid",     label: "Cotisation payée",       group: "Famille Diallo",     method: "Wave",         amount: "-30 000", currency: "FCFA", date: "25 avril 2026", time: "11:30",    status: "completed", avatar: "https://i.pravatar.cc/40?img=47" },
  { id: "6", type: "received", label: "Pot reçu",               group: "Famille Diallo",     method: "Orange Money", amount: "+360 000", currency: "FCFA", date: "25 avril 2026", time: "12:00",    status: "completed", avatar: "https://i.pravatar.cc/40?img=47" },
];

const tabs = ["Tous", "Cotisations", "Versements", "En attente"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getPlatform(type: string) {
  return PLATFORM_CATALOG.find((p) => p.type === type) ?? PLATFORM_CATALOG[0];
}

function maskNumber(n: string, type: string) {
  if (!n) return "";
  if (type === "visa" || type === "mastercard") {
    return `•••• •••• •••• ${n.slice(-4)}`;
  }
  return `${n.slice(0, 4)} •••• ${n.slice(-2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("Tous");
  const [search, setSearch] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);

  // Add method modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<PaymentMethod["type"]>("wave");
  const [addNumber, setAddNumber] = useState("");
  const [addError, setAddError] = useState("");

  // Pay modal
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tontiflow_payment_methods");
    if (stored) setMethods(JSON.parse(stored));
  }, []);

  const saveMethods = (updated: PaymentMethod[]) => {
    setMethods(updated);
    localStorage.setItem("tontiflow_payment_methods", JSON.stringify(updated));
  };

  // ── Add method ──
  const handleAddMethod = () => {
    setAddError("");
    if (!addNumber.trim()) { setAddError("Veuillez saisir un numéro."); return; }
    const platform = getPlatform(addType);
    const isCard = addType === "visa" || addType === "mastercard";
    if (isCard && addNumber.replace(/\s/g, "").length < 16) {
      setAddError("Le numéro de carte doit contenir 16 chiffres.");
      return;
    }
    const already = methods.find((m) => m.type === addType && m.number === addNumber.trim());
    if (already) { setAddError("Ce moyen de paiement est déjà enregistré."); return; }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: addType,
      label: platform.label,
      number: addNumber.trim(),
      isDefault: methods.length === 0,
    };
    saveMethods([...methods, newMethod]);
    setShowAddModal(false);
    setAddNumber("");
    setAddType("wave");
  };

  // ── Set default ──
  const setDefault = (id: string) => {
    saveMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  // ── Delete ──
  const deleteMethod = (id: string) => {
    const updated = methods.filter((m) => m.id !== id);
    if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
      updated[0].isDefault = true;
    }
    saveMethods(updated);
  };

  const handlePaySuccess = () => {
    const stored = JSON.parse(localStorage.getItem("tontiflow_transactions") || "[]");
    if (stored.length > 0) setTransactions((prev) => [stored[0], ...prev]);
  };

  // ── Filter transactions ──
  const filtered = transactions.filter((t) => {
    const matchTab =
      activeTab === "Tous" ? true :
      activeTab === "Cotisations" ? t.type === "paid" :
      activeTab === "Versements" ? t.type === "received" :
      t.status === "pending" || t.status === "upcoming";
    const matchSearch = t.group.toLowerCase().includes(search.toLowerCase()) || t.label.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-7 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500 mt-0.5">Gérez vos moyens de paiement et votre historique</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-emerald-400 transition-colors">
          <Download className="w-4 h-4" />
          Exporter PDF
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total cotisé",  value: "190 000 FCFA", icon: ArrowUpRight,   color: "text-red-500 bg-red-50",      sub: "Ce mois" },
          { label: "Total reçu",    value: "360 000 FCFA", icon: ArrowDownLeft,  color: "text-emerald-600 bg-emerald-50", sub: "Ce mois" },
          { label: "En attente",    value: "30 000 FCFA",  icon: Clock,          color: "text-orange-500 bg-orange-50", sub: "Avant le 25 juin" },
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

      {/* ── Payment due banner ── */}
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
        <button
          onClick={() => { setShowPayModal(true); setPaySuccess(false); }}
          className="shrink-0 px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-emerald-200"
        >
          Payer maintenant
        </button>
      </div>

      {/* ── Payment methods ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Moyens de paiement
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
              <Wallet className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Aucun moyen de paiement configuré</p>
            <p className="text-xs text-gray-400 mb-4">Ajoutez Wave, Orange Money, MTN, Free Money ou une carte bancaire.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              + Ajouter un moyen de paiement
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {methods.map((m) => {
              const p = getPlatform(m.type);
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    m.isDefault ? "border-emerald-400 bg-emerald-50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${p.bg} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                      {p.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                        {m.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">Défaut</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{maskNumber(m.number, m.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.isDefault && (
                      <button
                        onClick={() => setDefault(m.id)}
                        className="text-xs text-emerald-600 font-medium hover:underline px-2"
                      >
                        Définir défaut
                      </button>
                    )}
                    <button
                      onClick={() => deleteMethod(m.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              + Ajouter un autre moyen de paiement
            </button>
          </div>
        )}
      </div>

      {/* ── Transactions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 space-y-4 border-b border-gray-50">
          <div className="flex gap-1 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === t ? "gradient-emerald text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-emerald-400">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Aucune transaction trouvée.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <Image src={t.avatar} alt={t.group} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    t.status === "completed" ? "bg-emerald-100" : "bg-orange-100"
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
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL — Add payment method
      ══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Ajouter un moyen de paiement</h2>
              <button onClick={() => { setShowAddModal(false); setAddError(""); setAddNumber(""); }} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Platform selector */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Choisissez la plateforme</p>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORM_CATALOG.map((p) => (
                    <button
                      key={p.type}
                      onClick={() => setAddType(p.type)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        addType === p.type ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${p.bg} text-white text-xs font-bold flex items-center justify-center`}>
                        {p.logo}
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {getPlatform(addType).hint}
                </label>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getPlatform(addType).bg} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                    {getPlatform(addType).logo}
                  </div>
                  <input
                    type="text"
                    value={addNumber}
                    onChange={(e) => { setAddNumber(e.target.value); setAddError(""); }}
                    placeholder={addType === "visa" || addType === "mastercard" ? "1234 5678 9012 3456" : "+221 77 000 00 00"}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddMethod()}
                  />
                </div>
                {addError && <p className="text-xs text-red-500 mt-1.5">{addError}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setShowAddModal(false); setAddError(""); setAddNumber(""); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddMethod}
                  className="flex-1 py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        amount="30 000"
        currency="FCFA"
        groupName="Famille Diallo"
        onSuccess={handlePaySuccess}
      />
    </div>
  );
}
