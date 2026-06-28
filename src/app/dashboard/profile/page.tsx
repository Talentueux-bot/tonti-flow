"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Star, TrendingUp, Shield, CheckCircle, Award } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDashboardStats, updateProfileInfo, formatAmount } from "@/lib/db";
import AccountPanel from "@/components/dashboard/AccountPanel";

export default function ProfilePage() {
  const { profile } = useAuth();
  const initials =
    (profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "") ||
    profile.fullName.slice(0, 2).toUpperCase();

  const [groupCount, setGroupCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [totalContributed, setTotalContributed] = useState(0);

  // Formulaire d'édition
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone);
  }, [profile.firstName, profile.lastName, profile.phone]);

  const saveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      await updateProfileInfo({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
      toast.success("Profil mis à jour ✅");
    } catch {
      toast.error("Échec de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getDashboardStats().then((s) => {
      setGroupCount(s.groupCount);
      setPaidCount(s.groups.reduce((acc, g) => acc + g.paidCount, 0));
      setTotalContributed(s.totalManaged);
    });
  }, []);

  const hasActivity = paidCount > 0;
  const stats = [
    { label: "Tontines", value: String(groupCount), icon: TrendingUp, color: "text-emerald-600" },
    { label: "Cotisations payées", value: String(paidCount), icon: CheckCircle, color: "text-blue-600" },
    { label: "Montant total cotisé", value: formatAmount(totalContributed, profile.currency), icon: Award, color: "text-purple-600" },
    { label: "Score de confiance", value: hasActivity ? "Bon" : "Nouveau", icon: Shield, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-7 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-500 mt-0.5">Gérez vos informations personnelles</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover */}
        <div className="h-28 gradient-dark relative" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative inline-block -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl gradient-emerald flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white uppercase">
              {initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-emerald flex items-center justify-center shadow-md">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              <p className="text-gray-400 text-sm">
                {profile.phone || "Téléphone non renseigné"}
                {profile.country ? ` · ${profile.country}` : ""}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold bg-emerald-50 border-emerald-200 text-emerald-700">
                  {hasActivity ? "🏆 Membre actif" : "✨ Nouveau membre"}
                </span>
                {groupCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold bg-purple-50 border-purple-200 text-purple-700">
                    🤝 {groupCount} tontine{groupCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            <a href="#edit-profile" className="shrink-0 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity text-center">
              Modifier le profil
            </a>
          </div>
        </div>
      </div>

      {/* Sécurité du compte + Solde */}
      <AccountPanel />

      {/* Trust score */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Score de confiance
          </h2>
          <span className="text-2xl font-bold text-emerald-600">{hasActivity ? "Bon" : "—"}</span>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full gradient-emerald" style={{ width: `${hasActivity ? 100 : 0}%` }} />
        </div>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`w-5 h-5 ${hasActivity && i <= 5 ? "text-amber-400" : "text-gray-200"}`} fill={hasActivity && i <= 5 ? "#fbbf24" : "#e5e7eb"} />
          ))}
          <span className="text-sm text-gray-400 ml-2">Basé sur {paidCount} paiement{paidCount > 1 ? "s" : ""}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ponctualité", pct: hasActivity ? 100 : 0 },
            { label: "Fiabilité", pct: hasActivity ? 100 : 0 },
            { label: "Participation", pct: hasActivity ? 100 : 0 },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
              <div className="relative w-12 h-12 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${s.pct * 0.94} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">{s.pct}%</span>
              </div>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div id="edit-profile" className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-4">Informations personnelles</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
          <p className="text-[11px] text-gray-400 mt-1">L&apos;email ne peut pas être modifié ici.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+221 77 000 00 00"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center justify-center"
        >
          {saving ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Sauvegarder les modifications"}
        </button>
      </div>
    </div>
  );
}
