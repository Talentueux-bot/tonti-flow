import Image from "next/image";
import { Camera, Star, TrendingUp, Shield, CheckCircle, Award } from "lucide-react";

const badges = [
  { icon: "🏆", label: "Payeur régulier", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { icon: "⚡", label: "Membre fondateur", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { icon: "🌍", label: "Diaspora", color: "bg-blue-50 border-blue-200 text-blue-700" },
];

const stats = [
  { label: "Tontines rejointes", value: "4", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Cotisations payées", value: "24", icon: CheckCircle, color: "text-blue-600" },
  { label: "Montant total cotisé", value: "720 000 FCFA", icon: Award, color: "text-purple-600" },
  { label: "Score de confiance", value: "4.8/5", icon: Shield, color: "text-amber-600" },
];

export default function ProfilePage() {
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
            <Image
              src="https://i.pravatar.cc/80?img=47"
              alt="Profile"
              width={80}
              height={80}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white"
            />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-emerald flex items-center justify-center shadow-md">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Aminata Kouyaté</h2>
              <p className="text-gray-500 text-sm">aminata.kouyate@example.com</p>
              <p className="text-gray-400 text-sm">+221 77 123 45 67 · 🇸🇳 Dakar, Sénégal</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {badges.map((b) => (
                  <span key={b.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${b.color}`}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>

            <button className="shrink-0 px-4 py-2 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Modifier le profil
            </button>
          </div>
        </div>
      </div>

      {/* Trust score */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Score de confiance
          </h2>
          <span className="text-2xl font-bold text-emerald-600">4.8 / 5</span>
        </div>

        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full gradient-emerald" style={{ width: "96%" }} />
        </div>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={`w-5 h-5 ${i <= 4 ? "text-amber-400" : "text-gray-200"}`} fill={i <= 4 ? "#fbbf24" : "#e5e7eb"} />
          ))}
          <span className="text-sm text-gray-400 ml-2">Basé sur 24 paiements</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ponctualité", pct: 95 },
            { label: "Fiabilité", pct: 100 },
            { label: "Participation", pct: 90 },
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-4">Informations personnelles</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Prénom", value: "Aminata" },
            { label: "Nom", value: "Kouyaté" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                type="text"
                defaultValue={f.value}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            defaultValue="aminata.kouyate@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
          <input
            type="tel"
            defaultValue="+221 77 123 45 67"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <button className="px-6 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
}
