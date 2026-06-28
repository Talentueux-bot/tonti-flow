"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck, CheckCircle2, Circle, Upload, Wallet,
  ArrowDownLeft, ArrowUpRight, X, ChevronRight, BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import PaymentLogo from "@/components/dashboard/PaymentLogo";
import { PAYMENT_CATALOG, type PaymentType } from "@/lib/paymentMethods";
import {
  getMyProfile, updateVerification, uploadIdDocument, setWithdrawal,
  listWalletTransactions, formatAmount,
  type MyProfile, type WalletTx,
} from "@/lib/db";
import { startPawapayCheckout } from "@/lib/checkout";
import FeeSummary from "@/components/dashboard/FeeSummary";
import { supabase } from "@/lib/supabase";

const DOC_TYPES = [
  { value: "cni", label: "Carte d'identité" },
  { value: "passport", label: "Passeport" },
  { value: "permis", label: "Permis de conduire" },
];

type Modal = null | "verify" | "withdrawal" | "deposit" | "withdraw";

export default function AccountPanel() {
  const { profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [txs, setTxs] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);

  // Champs de formulaires
  const [dob, setDob] = useState("");
  const [docType, setDocType] = useState("cni");
  const [file, setFile] = useState<File | null>(null);
  const [wProvider, setWProvider] = useState<PaymentType>("wave");
  const [wNumber, setWNumber] = useState("");
  const [amount, setAmount] = useState("");

  const reload = useCallback(async () => {
    try {
      // Déclenche la validation auto si la vérification attend depuis > 5 min.
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetch("/api/verification/self-check", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        }
      } catch { /* non bloquant */ }

      const [p, t] = await Promise.all([getMyProfile(), listWalletTransactions()]);
      setProfile(p);
      setTxs(t);
      if (p?.date_of_birth) setDob(p.date_of_birth);
      if (p?.withdrawal_provider) setWProvider(p.withdrawal_provider as PaymentType);
      if (p?.withdrawal_number) setWNumber(p.withdrawal_number);
    } catch {
      toast.error("Impossible de charger les informations du compte.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading || !profile) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex justify-center">
        <span className="w-7 h-7 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const vstatus = profile.verification_status ?? "unverified";
  const securityDone = vstatus === "approved";
  const gainsDone = !!profile.withdrawal_number;
  const securityDetail =
    vstatus === "pending" ? "Vérification en cours — vous recevrez la réponse par email sous quelques minutes."
    : vstatus === "rejected" ? "Vérification refusée. Renvoyez une photo nette de votre pièce d'identité."
    : vstatus === "approved" ? "Votre identité est vérifiée."
    : "Vérifiez votre nom complet, votre date de naissance et ajoutez une pièce d'identité.";
  const steps = [
    { key: "account", title: "Compte créé", detail: "Votre compte TontiFlow est actif.", done: true, action: null as Modal },
    {
      key: "security",
      title: "Sécurité du compte",
      detail: securityDetail,
      done: securityDone,
      action: "verify" as Modal,
    },
    {
      key: "gains",
      title: "Recevoir vos gains",
      detail: "Ajoutez un numéro pour recevoir vos retraits automatiquement.",
      done: gainsDone,
      action: "withdrawal" as Modal,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  // ── Actions ──
  const submitVerify = async () => {
    if (!dob) { toast.error("Renseignez votre date de naissance."); return; }
    if (!file && !profile.id_document_path) { toast.error("Ajoutez une pièce d'identité."); return; }
    setBusy(true);
    try {
      if (file) await uploadIdDocument(file, docType);
      // L'utilisateur passe « en attente de validation » : l'admin a 5 min pour
      // réagir, sinon validation automatique. La réponse est envoyée par email.
      await updateVerification({
        date_of_birth: dob,
        verification_status: "pending",
        verification_submitted_at: new Date().toISOString(),
      });
      toast.success("Pièce envoyée — vérification en cours ⏳");
      setModal(null);
      setFile(null);
      await reload();
    } catch {
      toast.error("Échec de la vérification.");
    } finally {
      setBusy(false);
    }
  };

  const submitWithdrawal = async () => {
    if (!wNumber.trim()) { toast.error("Saisissez un numéro."); return; }
    setBusy(true);
    try {
      await setWithdrawal(wProvider, wNumber.trim());
      toast.success("Numéro de retrait enregistré ✅");
      setModal(null);
      await reload();
    } catch {
      toast.error("Échec de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  };

  const submitDeposit = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast.error("Montant invalide."); return; }
    setBusy(true);
    try {
      // Recharge réelle via PawaPay (frais de service inclus dans le total).
      await startPawapayCheckout({ purpose: "recharge", amount: n });
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  const submitWithdraw = async () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) { toast.error("Montant invalide."); return; }
    if (n > profile.balance) { toast.error("Solde insuffisant."); return; }
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/pawapay/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ amount: n }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(j.error || "Échec du retrait."); return; }
      toast.success("Retrait initié — vous allez recevoir l'argent sur votre Mobile Money.");
      setModal(null);
      setAmount("");
      await reload();
    } catch {
      toast.error("Erreur lors du retrait.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* ─── Sécurité du compte (checklist + taux de réalisation) ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Sécurité du compte
          </h2>
          <span className="text-sm font-bold text-emerald-600">{pct}%</span>
        </div>

        {/* Barre de progression */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div className="h-full rounded-full gradient-emerald transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mb-5">{doneCount}/{steps.length} étapes complétées · Taux de réalisation</p>

        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.key}
              className={`flex items-start gap-3 p-4 rounded-xl border ${
                s.done ? "border-emerald-100 bg-emerald-50/40" : "border-gray-100 bg-gray-50"
              }`}
            >
              {s.done
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                : <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.detail}</p>
              </div>
              {s.done ? (
                <span className="text-[11px] font-semibold text-emerald-600 shrink-0 mt-1">Terminé</span>
              ) : s.key === "security" && vstatus === "pending" ? (
                <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-semibold mt-0.5">
                  <Circle className="w-3 h-3" /> En attente
                </span>
              ) : s.action ? (
                <button
                  onClick={() => setModal(s.action)}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg gradient-emerald text-white text-xs font-semibold hover:opacity-90"
                >
                  {s.key === "security" ? (vstatus === "rejected" ? "Renvoyer" : "Vérifier") : "Ajouter"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Mon solde (recharge / retrait) ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="gradient-dark p-6">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-200 text-sm font-medium">Mon solde</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatAmount(profile.balance, authProfile.currency)}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setAmount(""); setModal("deposit"); }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
            >
              <ArrowDownLeft className="w-4 h-4" /> Recharger
            </button>
            <button
              onClick={() => { setAmount(""); setModal(profile.withdrawal_number ? "withdraw" : "withdrawal"); }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 border border-white/20"
            >
              <ArrowUpRight className="w-4 h-4" /> Retirer
            </button>
          </div>
        </div>

        {/* Historique portefeuille */}
        <div className="divide-y divide-gray-50">
          {txs.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Aucune opération sur votre solde.</p>
          ) : (
            txs.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  t.type === "deposit" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                }`}>
                  {t.type === "deposit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{t.type === "deposit" ? "Recharge" : "Retrait"}</p>
                  <p className="text-xs text-gray-400">
                    {t.method ?? "—"} · {new Date(t.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-sm font-bold ${t.type === "deposit" ? "text-emerald-600" : "text-gray-800"}`}>
                  {t.type === "deposit" ? "+" : "−"}{formatAmount(Number(t.amount), authProfile.currency)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ════════ MODALS ════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "verify" && "Vérifier mon compte"}
                {modal === "withdrawal" && "Recevoir mes gains"}
                {modal === "deposit" && "Recharger mon solde"}
                {modal === "withdraw" && "Retirer de l'argent"}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* ── Vérification ── */}
              {modal === "verify" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-800">{authProfile.fullName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de naissance</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de pièce</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pièce justificative</label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-emerald-400 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">
                        {file ? file.name : profile.id_document_path ? "Pièce déjà envoyée — remplacer" : "Importer une photo / PDF"}
                      </span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button onClick={submitVerify} disabled={busy} className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center">
                    {busy ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Valider la vérification"}
                  </button>
                </>
              )}

              {/* ── Numéro de retrait ── */}
              {modal === "withdrawal" && (
                <>
                  <p className="text-sm text-gray-500">Ce numéro recevra automatiquement vos gains et vos retraits.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PAYMENT_CATALOG.filter((p) => ["wave", "orange", "mtn", "free"].includes(p.type)).map((p) => (
                        <button
                          key={p.type}
                          onClick={() => setWProvider(p.type)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                            wProvider === p.type ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <PaymentLogo type={p.type} className="w-8 h-8" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de retrait</label>
                    <input
                      type="tel"
                      value={wNumber}
                      onChange={(e) => setWNumber(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <button onClick={submitWithdrawal} disabled={busy} className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center">
                    {busy ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Enregistrer le numéro"}
                  </button>
                </>
              )}

              {/* ── Recharge ── */}
              {modal === "deposit" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant à recharger</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10 000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{authProfile.currency}</span>
                    </div>
                  </div>
                  {parseFloat(amount) > 0 && (
                    <FeeSummary amount={parseFloat(amount)} currency={authProfile.currency} label="Montant à recharger" />
                  )}
                  <p className="text-[11px] text-gray-400">Le moyen de paiement (Wave, Orange, MTN…) sera choisi sur la page sécurisée PawaPay.</p>
                  <button onClick={submitDeposit} disabled={busy} className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center">
                    {busy ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Payer via Mobile Money"}
                  </button>
                </>
              )}

              {/* ── Retrait ── */}
              {modal === "withdraw" && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                    <span className="text-gray-500">Solde disponible</span>
                    <span className="font-bold text-gray-900">{formatAmount(profile.balance, authProfile.currency)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <PaymentLogo type={(profile.withdrawal_provider as PaymentType) ?? "wave"} className="w-8 h-8" />
                    Vers : <span className="font-medium text-gray-700">{profile.withdrawal_number}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant à retirer</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="5 000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-16"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{authProfile.currency}</span>
                    </div>
                  </div>
                  <button onClick={submitWithdraw} disabled={busy} className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center">
                    {busy ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Confirmer le retrait"}
                  </button>
                  <button onClick={() => setModal("withdrawal")} className="w-full text-xs text-emerald-600 hover:underline">
                    Modifier le numéro de retrait
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
