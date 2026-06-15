"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle, ArrowUpRight, ArrowDownLeft, CreditCard,
  Search, Download, Plus, Trash2, X, Wallet, Lock,
} from "lucide-react";
import { getContributions, getAccountPlan, formatAmount } from "@/lib/db";
import { useAuth } from "@/components/auth/AuthProvider";
import PaymentLogo from "@/components/dashboard/PaymentLogo";
import { PAYMENT_CATALOG, getPlatform, maskNumber, type PaymentType } from "@/lib/paymentMethods";
import { type PlanId } from "@/lib/plans";

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string;
  type: PaymentType;
  label: string;
  number: string;
  isDefault: boolean;
};

type Transaction = {
  id: string;
  label: string;
  group: string;
  emoji: string;
  amount: number;
  currency: string;
  date: string;
};

type ContributionRow = {
  id: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  groups: { name: string; emoji: string } | { name: string; emoji: string }[] | null;
};

export default function PaymentsPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalContributed, setTotalContributed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanId>("free");

  const cardLocked = (type: PaymentType) => (type === "visa" || type === "mastercard") && plan !== "diaspora";

  // Add method modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<PaymentMethod["type"]>("wave");
  const [addNumber, setAddNumber] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("tontiflow_payment_methods");
    if (stored) setMethods(JSON.parse(stored));

    getAccountPlan().then(setPlan);

    getContributions()
      .then((rows) => {
        const list = (rows as ContributionRow[]).map((r) => {
          const g = Array.isArray(r.groups) ? r.groups[0] : r.groups;
          return {
            id: r.id,
            label: "Cotisation payée",
            group: g?.name ?? "Tontine",
            emoji: g?.emoji ?? "🤝",
            amount: Number(r.amount),
            currency: profile.currency,
            date: new Date(r.paid_at ?? r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          };
        });
        setTransactions(list);
        setTotalContributed(list.reduce((s, t) => s + t.amount, 0));
      })
      .finally(() => setLoading(false));
  }, [profile.currency]);

  const saveMethods = (updated: PaymentMethod[]) => {
    setMethods(updated);
    localStorage.setItem("tontiflow_payment_methods", JSON.stringify(updated));
  };

  const handleAddMethod = () => {
    setAddError("");
    if (cardLocked(addType)) { setAddError("Les cartes bancaires sont réservées au plan Diaspora."); return; }
    if (!addNumber.trim()) { setAddError("Veuillez saisir un numéro."); return; }
    const platform = getPlatform(addType);
    const isCard = addType === "visa" || addType === "mastercard";
    if (isCard && addNumber.replace(/\s/g, "").length < 16) {
      setAddError("Le numéro de carte doit contenir 16 chiffres.");
      return;
    }
    if (methods.find((m) => m.type === addType && m.number === addNumber.trim())) {
      setAddError("Ce moyen de paiement est déjà enregistré.");
      return;
    }
    saveMethods([...methods, {
      id: Date.now().toString(),
      type: addType,
      label: platform.label,
      number: addNumber.trim(),
      isDefault: methods.length === 0,
    }]);
    setShowAddModal(false);
    setAddNumber("");
    setAddType("wave");
  };

  const setDefault = (id: string) => saveMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));

  const deleteMethod = (id: string) => {
    const updated = methods.filter((m) => m.id !== id);
    if (updated.length > 0 && !updated.some((m) => m.isDefault)) updated[0].isDefault = true;
    saveMethods(updated);
  };

  const filtered = transactions.filter(
    (t) => t.group.toLowerCase().includes(search.toLowerCase()) || t.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total cotisé", value: formatAmount(totalContributed, profile.currency), icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-50" },
          { label: "Cotisations", value: `${transactions.length}`, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
          { label: "Moyens de paiement", value: `${methods.length}`, icon: Wallet, color: "text-purple-600 bg-purple-50" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`w-8 h-8 rounded-xl ${c.color} flex items-center justify-center mb-2`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-gray-900">{loading ? "—" : c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Moyens de paiement
          </h2>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
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
            <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              + Ajouter un moyen de paiement
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {methods.map((m) => {
              return (
                <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  m.isDefault ? "border-emerald-400 bg-emerald-50" : "border-gray-100 bg-gray-50"
                }`}>
                  <div className="flex items-center gap-3">
                    <PaymentLogo type={m.type} className="w-10 h-10 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                        {m.isDefault && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">Défaut</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{maskNumber(m.number, m.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.isDefault && (
                      <button onClick={() => setDefault(m.id)} className="text-xs text-emerald-600 font-medium hover:underline px-2">Définir défaut</button>
                    )}
                    <button onClick={() => deleteMethod(m.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 mb-3">Historique des cotisations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-7 h-7 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {transactions.length === 0 ? "Aucune cotisation enregistrée pour l'instant." : "Aucune transaction trouvée."}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl">{t.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.group}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{formatAmount(t.amount, t.currency)}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL — Add payment method */}
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
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Choisissez la plateforme</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_CATALOG.map((p) => {
                    const locked = cardLocked(p.type);
                    return (
                      <button
                        key={p.type}
                        onClick={() => { if (locked) { setAddError("Cartes bancaires réservées au plan Diaspora."); } else { setAddType(p.type); setAddError(""); } }}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          locked ? "border-gray-100 opacity-50" :
                          addType === p.type ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {locked && <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-400" />}
                        <PaymentLogo type={p.type} className="w-9 h-9" />
                        <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                {plan !== "diaspora" && (
                  <p className="text-[11px] text-gray-400 -mt-2">
                    💳 Les cartes bancaires (Visa, Mastercard) sont réservées au{" "}
                    <Link href="/dashboard/upgrade" className="text-emerald-600 hover:underline font-medium">plan Diaspora</Link>.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{getPlatform(addType).hint}</label>
                <div className="flex items-center gap-3">
                  <PaymentLogo type={addType} className="w-10 h-10 shrink-0" />
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
                <button onClick={() => { setShowAddModal(false); setAddError(""); setAddNumber(""); }} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleAddMethod} className="flex-1 py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
