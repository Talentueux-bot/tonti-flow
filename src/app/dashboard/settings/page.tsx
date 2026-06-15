"use client";

import { useState, useEffect } from "react";
import {
  Bell, Shield, Smartphone, Globe, Trash2, ChevronRight,
  MessageCircle, Moon, Plus, Zap, Lock, Check, X,
  Eye, EyeOff, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getReminderUsage, PLANS } from "@/lib/plans";
import { getAccountPlan, setAccountPlan, countGroups } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = {
  id: string; type: string; label: string; number: string; isDefault: boolean;
};

type NotifSettings = {
  remindersEnabled: boolean;
  paymentConfirmEnabled: boolean;
  beneficiaryEnabled: boolean;
  newMembersEnabled: boolean;
  channelWhatsapp: boolean;
  channelEmail: boolean;
  channelPush: boolean;
  darkMode: boolean;
  langue: string;
  devise: string;
};

const DEFAULT_NOTIF: NotifSettings = {
  remindersEnabled: true,
  paymentConfirmEnabled: true,
  beneficiaryEnabled: true,
  newMembersEnabled: false,
  channelWhatsapp: true,
  channelEmail: true,
  channelPush: false,
  darkMode: false,
  langue: "Français",
  devise: "FCFA (XOF)",
};

const PLATFORM_BG: Record<string, string> = {
  wave: "bg-blue-500", orange: "bg-orange-500", mtn: "bg-yellow-500",
  free: "bg-red-500", visa: "bg-indigo-600", mastercard: "bg-rose-600",
};
const PLATFORM_LOGO: Record<string, string> = {
  wave: "W", orange: "O", mtn: "M", free: "F", visa: "V", mastercard: "MC",
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full flex items-center transition-all shrink-0 ${
        on ? "gradient-emerald justify-end pr-0.5" : "bg-gray-200 justify-start pl-0.5"
      }`}
    >
      <div className="w-5 h-5 rounded-full bg-white shadow" />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Plan
  const [planId, setPlanId] = useState<"free" | "pro" | "diaspora">("free");
  const [reminders, setReminders] = useState({ used: 0, max: 10 });
  const [groupCount, setGroupCount] = useState(0);

  // Notifications
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);

  // Moyens de paiement
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  // UI
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal — changer mot de passe
  const [showPwd, setShowPwd] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwdVal, setShowPwdVal] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  // Modal — 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [twoFASuccess, setTwoFASuccess] = useState(false);

  // Modal — supprimer compte
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // ── Load ──
  useEffect(() => {
    const stored = localStorage.getItem("tontiflow_notif_settings");
    if (stored) setNotif(JSON.parse(stored));

    const pm = localStorage.getItem("tontiflow_payment_methods");
    if (pm) setMethods(JSON.parse(pm));

    getAccountPlan().then(setPlanId);
    setReminders(getReminderUsage());
    countGroups().then(setGroupCount);

    const fa = localStorage.getItem("tontiflow_2fa");
    if (fa) setTwoFAEnabled(fa === "true");
  }, []);

  const set = <K extends keyof NotifSettings>(key: K, val: NotifSettings[K]) =>
    setNotif((prev) => ({ ...prev, [key]: val }));

  // ── Save settings ──
  const handleSave = () => {
    localStorage.setItem("tontiflow_notif_settings", JSON.stringify(notif));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // ── Change password ──
  const handleChangePwd = () => {
    setPwdError("");
    if (!pwdCurrent) { setPwdError("Saisissez votre mot de passe actuel."); return; }
    if (pwdNew.length < 8) { setPwdError("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (pwdNew !== pwdConfirm) { setPwdError("Les mots de passe ne correspondent pas."); return; }
    setPwdSuccess(true);
    setTimeout(() => { setShowPwd(false); setPwdSuccess(false); setPwdCurrent(""); setPwdNew(""); setPwdConfirm(""); }, 2000);
  };

  // ── 2FA ──
  const handleSendOTP = () => { setOtpSent(true); };
  const handleVerifyOTP = () => {
    if (otp.length < 4) return;
    const next = !twoFAEnabled;
    setTwoFAEnabled(next);
    localStorage.setItem("tontiflow_2fa", String(next));
    setTwoFASuccess(true);
    setTimeout(() => { setShow2FA(false); setTwoFASuccess(false); setOtp(""); setOtpSent(false); }, 2000);
  };

  // ── Delete account ──
  const handleDelete = () => {
    if (deleteConfirm !== "SUPPRIMER") return;
    ["tontiflow_groups","tontiflow_notif_settings","tontiflow_payment_methods",
     "tontiflow_2fa","tontiflow_plan","tontiflow_reminders_used"].forEach(
      (k) => localStorage.removeItem(k)
    );
    window.location.href = "/";
  };

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

      {/* ── Plan ── */}
      <div className={`rounded-2xl p-5 border ${planId === "free" ? "bg-gray-50 border-gray-200" : "gradient-dark border-0"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${planId === "free" ? "bg-white border border-gray-200" : "bg-white/10"}`}>
              <Zap className={`w-5 h-5 ${planId === "free" ? "text-gray-500" : "text-emerald-400"}`} fill={planId !== "free" ? "currentColor" : "none"} />
            </div>
            <div>
              <p className={`text-sm font-bold ${planId === "free" ? "text-gray-900" : "text-white"}`}>Plan {PLANS[planId].name}</p>
              <p className={`text-xs mt-0.5 ${planId === "free" ? "text-gray-500" : "text-emerald-300"}`}>{PLANS[planId].price}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/dashboard/upgrade" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-emerald text-white text-xs font-semibold hover:opacity-90">
              <Zap className="w-3.5 h-3.5" fill="white" /> {planId === "free" ? "Passer au Pro" : "Changer de formule"}
            </Link>
            {planId !== "free" && (
              <button
                onClick={async () => {
                  if (!confirm("Revenir au plan Gratuit ? Les limites du plan Gratuit s'appliqueront.")) return;
                  await setAccountPlan("free");
                  setPlanId("free");
                  toast.success("Vous êtes repassé au plan Gratuit.");
                }}
                className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 border border-white/20"
              >
                Repasser en Gratuit
              </button>
            )}
          </div>
        </div>
        {planId === "free" && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {[
              { label: "Groupes créés", used: groupCount, max: PLANS.free.maxGroups },
              { label: "Rappels WhatsApp", used: reminders.used, max: reminders.max, sub: "ce mois" },
            ].map(({ label, used, max, sub }) => (
              <div key={label} className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                  {used >= max && <Lock className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-lg font-bold text-gray-900">{used}</span>
                  <span className="text-xs text-gray-400">/ {max} {sub ?? "max"}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${used >= max ? "bg-orange-400" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min((used / max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: "Rappels de cotisation", desc: "Recevoir un rappel avant l'échéance", key: "remindersEnabled" as const },
            { label: "Confirmation de paiement", desc: "Notification après chaque paiement", key: "paymentConfirmEnabled" as const },
            { label: "Nouveau bénéficiaire", desc: "Quand le tour d'un membre arrive", key: "beneficiaryEnabled" as const },
            { label: "Nouveaux membres", desc: "Quand quelqu'un rejoint votre tontine", key: "newMembersEnabled" as const },
          ].map(({ label, desc, key }) => (
            <div key={key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <Toggle on={notif[key] as boolean} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Canal de notification ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Canal de notification</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: "WhatsApp", desc: "Rappels et confirmations via WhatsApp", key: "channelWhatsapp" as const },
            { label: "Email", desc: "Résumés hebdomadaires par email", key: "channelEmail" as const },
            { label: "Notifications push", desc: "Alertes sur votre téléphone", key: "channelPush" as const },
          ].map(({ label, desc, key }) => (
            <div key={key} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <Toggle on={notif[key] as boolean} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Apparence ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Moon className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Apparence</h2>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Mode sombre</p>
            <p className="text-xs text-gray-400 mt-0.5">Interface en thème sombre</p>
          </div>
          <Toggle on={notif.darkMode} onChange={(v) => set("darkMode", v)} />
        </div>
      </div>

      {/* ── Région & Langue ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Globe className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Région & Langue</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
            <select
              value={notif.langue}
              onChange={(e) => set("langue", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option>Français</option>
              <option>English</option>
              <option>Wolof</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Devise</label>
            <select
              value={notif.devise}
              onChange={(e) => set("devise", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option>FCFA (XOF)</option>
              <option>EUR (€)</option>
              <option>USD ($)</option>
              <option>GHS (₵)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Sécurité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="font-semibold text-gray-900">Sécurité</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <button onClick={() => setShowPwd(true)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900">Changer le mot de passe</p>
              <p className="text-xs text-gray-400 mt-0.5">Dernière modification il y a 3 mois</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setShow2FA(true)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-gray-900">Authentification à 2 facteurs</p>
              <p className="text-xs mt-0.5">
                <span className={`font-semibold ${twoFAEnabled ? "text-emerald-600" : "text-orange-500"}`}>
                  {twoFAEnabled ? "✓ Activée" : "Non activée — recommandé"}
                </span>
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Sessions actives</p>
              <p className="text-xs text-gray-400 mt-0.5">2 appareils connectés</p>
            </div>
            <button className="text-xs text-red-500 font-semibold hover:underline">Déconnecter tout</button>
          </div>
        </div>
      </div>

      {/* ── Moyens de paiement ── */}
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
              <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90">
                <Plus className="w-4 h-4" /> Ajouter
              </Link>
            </div>
          ) : (
            <>
              {methods.map((m) => (
                <button key={m.id} onClick={() => setDefault(m.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${m.isDefault ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
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
                </button>
              ))}
              <Link href="/dashboard/payments" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <Plus className="w-4 h-4" /> Ajouter un moyen de paiement
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Zone de danger ── */}
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-red-50">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-red-600">Zone de danger</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Supprimer mon compte</p>
              <p className="text-xs text-gray-500 mt-0.5">Cette action est irréversible. Toutes vos données seront supprimées.</p>
            </div>
            <button onClick={() => setShowDelete(true)} className="shrink-0 px-4 py-2 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* ── Bouton sauvegarder ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Check className="w-4 h-4" /> Paramètres sauvegardés !
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-xl gradient-emerald text-white font-semibold hover:opacity-90 transition-opacity text-sm shadow-md shadow-emerald-200"
        >
          Sauvegarder les paramètres
        </button>
      </div>

      {/* ══════ MODAL — Mot de passe ══════ */}
      {showPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            {pwdSuccess ? (
              <div className="flex flex-col items-center py-12 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg">Mot de passe modifié !</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Changer le mot de passe</h2>
                  <button onClick={() => { setShowPwd(false); setPwdError(""); }} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: "Mot de passe actuel", val: pwdCurrent, set: setPwdCurrent },
                    { label: "Nouveau mot de passe", val: pwdNew, set: setPwdNew },
                    { label: "Confirmer le nouveau", val: pwdConfirm, set: setPwdConfirm },
                  ].map(({ label, val, set: s }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <div className="relative">
                        <input type={showPwdVal ? "text" : "password"} value={val} onChange={(e) => s(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm pr-11"
                          onKeyDown={(e) => e.key === "Enter" && handleChangePwd()}
                        />
                        <button type="button" onClick={() => setShowPwdVal(!showPwdVal)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPwdVal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
                  <button onClick={handleChangePwd} className="w-full py-3 rounded-xl gradient-emerald text-white font-semibold text-sm hover:opacity-90">
                    Modifier le mot de passe
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════ MODAL — 2FA ══════ */}
      {show2FA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            {twoFASuccess ? (
              <div className="flex flex-col items-center py-12 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  2FA {twoFAEnabled ? "activée" : "désactivée"} !
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Authentification 2 facteurs</h2>
                  <button onClick={() => { setShow2FA(false); setOtpSent(false); setOtp(""); }} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className={`p-3 rounded-xl text-sm ${twoFAEnabled ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                    Statut : <strong>{twoFAEnabled ? "Activée ✓" : "Non activée"}</strong>
                  </div>
                  <p className="text-sm text-gray-600">
                    {twoFAEnabled ? "Désactivez la double authentification via SMS." : "Protégez votre compte avec un code SMS à chaque connexion."}
                  </p>
                  {!otpSent ? (
                    <button onClick={handleSendOTP} className="w-full py-3 rounded-xl gradient-emerald text-white font-semibold text-sm hover:opacity-90">
                      {twoFAEnabled ? "Envoyer un code pour désactiver" : "Envoyer le code SMS"}
                    </button>
                  ) : (
                    <>
                      <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-xs">Code envoyé sur votre numéro enregistré.</div>
                      <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="Code à 6 chiffres"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-center text-lg tracking-widest"
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                      />
                      <button onClick={handleVerifyOTP} disabled={otp.length < 4} className="w-full py-3 rounded-xl gradient-emerald text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50">
                        Confirmer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════ MODAL — Supprimer compte ══════ */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-red-50">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Supprimer mon compte
              </h2>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm(""); }} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Cette action est <strong>irréversible</strong>. Tous vos groupes, paiements et données seront définitivement supprimés.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tapez <strong>SUPPRIMER</strong> pour confirmer
                </label>
                <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
                />
              </div>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== "SUPPRIMER"}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                Supprimer définitivement mon compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
