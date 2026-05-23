"use client";

import { useState, useEffect } from "react";
import { X, Check, ChevronRight } from "lucide-react";

type PaymentMethod = {
  id: string;
  type: string;
  label: string;
  number: string;
  isDefault: boolean;
};

const PLATFORMS = [
  { type: "wave",       label: "Wave",         logo: "W",  bg: "bg-blue-500",   hint: "+221 77 000 00 00" },
  { type: "orange",     label: "Orange Money", logo: "O",  bg: "bg-orange-500", hint: "+221 77 000 00 00" },
  { type: "mtn",        label: "MTN Money",    logo: "M",  bg: "bg-yellow-500", hint: "+221 77 000 00 00" },
  { type: "free",       label: "Free Money",   logo: "F",  bg: "bg-red-500",    hint: "+221 77 000 00 00" },
  { type: "visa",       label: "Carte Visa",   logo: "V",  bg: "bg-indigo-600", hint: "1234 5678 9012 3456" },
  { type: "mastercard", label: "Mastercard",   logo: "MC", bg: "bg-rose-600",   hint: "1234 5678 9012 3456" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  amount: string;
  currency?: string;
  groupName: string;
  onSuccess?: () => void;
};

export default function PaymentModal({ open, onClose, amount, currency = "FCFA", groupName, onSuccess }: Props) {
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<string>("");

  // Quick pay (no saved method selected)
  const [quickType, setQuickType] = useState("wave");
  const [quickNumber, setQuickNumber] = useState("");
  const [quickError, setQuickError] = useState("");

  // UI state
  const [useQuick, setUseQuick] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem("tontiflow_payment_methods");
    const parsed: PaymentMethod[] = stored ? JSON.parse(stored) : [];
    setSavedMethods(parsed);
    // Pre-select default
    const def = parsed.find((m) => m.isDefault);
    if (def) setSelectedSaved(def.id);
    setUseQuick(parsed.length === 0);
    setSuccess(false);
    setQuickNumber("");
    setQuickError("");
  }, [open]);

  const platform = (type: string) => PLATFORMS.find((p) => p.type === type) ?? PLATFORMS[0];

  const handleConfirm = () => {
    setQuickError("");

    if (useQuick) {
      if (!quickNumber.trim()) {
        setQuickError("Veuillez saisir votre numéro.");
        return;
      }
      const isCard = quickType === "visa" || quickType === "mastercard";
      if (isCard && quickNumber.replace(/\s/g, "").length < 16) {
        setQuickError("Le numéro de carte doit contenir 16 chiffres.");
        return;
      }
    } else {
      if (!selectedSaved) {
        setQuickError("Veuillez sélectionner un moyen de paiement.");
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Save to transaction history
      const method = useQuick
        ? platform(quickType).label
        : savedMethods.find((m) => m.id === selectedSaved)?.label ?? "—";

      const newTx = {
        id: Date.now().toString(),
        type: "paid",
        label: "Cotisation payée",
        group: groupName,
        method,
        amount: `-${amount}`,
        currency,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: "completed",
        avatar: "https://i.pravatar.cc/40?img=47",
      };
      const existing = JSON.parse(localStorage.getItem("tontiflow_transactions") || "[]");
      localStorage.setItem("tontiflow_transactions", JSON.stringify([newTx, ...existing]));

      // Save quick method if asked
      if (useQuick && quickNumber.trim()) {
        const saved = JSON.parse(localStorage.getItem("tontiflow_payment_methods") || "[]");
        if (!saved.find((m: PaymentMethod) => m.type === quickType && m.number === quickNumber.trim())) {
          saved.push({ id: Date.now().toString(), type: quickType, label: platform(quickType).label, number: quickNumber.trim(), isDefault: saved.length === 0 });
          localStorage.setItem("tontiflow_payment_methods", JSON.stringify(saved));
        }
      }

      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2200);
    }, 1800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Check className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Paiement effectué !</h2>
            <p className="text-gray-500 text-sm">{amount} {currency} · {groupName}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payer ma cotisation</h2>
                <p className="text-sm text-gray-500 mt-0.5">{amount} {currency} · {groupName}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Saved methods */}
              {savedMethods.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Mes moyens de paiement</p>
                    <button
                      onClick={() => setUseQuick(!useQuick)}
                      className="text-xs text-emerald-600 font-medium hover:underline"
                    >
                      {useQuick ? "Utiliser un compte sauvegardé" : "Autre compte"}
                    </button>
                  </div>

                  {!useQuick && (
                    <div className="space-y-2">
                      {savedMethods.map((m) => {
                        const p = platform(m.type);
                        return (
                          <button
                            key={m.id}
                            onClick={() => setSelectedSaved(m.id)}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                              selectedSaved === m.id
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl ${p.bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                              {p.logo}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                              <p className="text-xs text-gray-400">{m.number.slice(0, 4)}••••{m.number.slice(-2)}</p>
                            </div>
                            {m.isDefault && <span className="text-[10px] font-bold text-emerald-500">Défaut</span>}
                            {selectedSaved === m.id && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Quick / new payment */}
              {(useQuick || savedMethods.length === 0) && (
                <div className="space-y-3">
                  {savedMethods.length === 0 && (
                    <p className="text-sm font-semibold text-gray-700">Choisissez votre moyen de paiement</p>
                  )}

                  {/* Platform grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.type}
                        onClick={() => { setQuickType(p.type); setQuickError(""); }}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${
                          quickType === p.type
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${p.bg} text-white text-xs font-bold flex items-center justify-center`}>
                          {p.logo}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Number input */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-xl ${platform(quickType).bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                        {platform(quickType).logo}
                      </div>
                      <input
                        type="text"
                        value={quickNumber}
                        onChange={(e) => { setQuickNumber(e.target.value); setQuickError(""); }}
                        placeholder={platform(quickType).hint}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                      />
                    </div>
                    {quickError && <p className="text-xs text-red-500 mt-1.5 pl-1">{quickError}</p>}
                  </div>
                </div>
              )}

              {/* Amount summary */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                <span className="text-gray-500">Montant à payer</span>
                <span className="font-bold text-gray-900">{amount} {currency}</span>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3.5 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirmer le paiement
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Paiement sécurisé · SSL 256 bits
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
