"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  TrendingUp, CalendarDays, Wallet, Receipt, BarChart3, ShieldAlert, Lock,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminEmail } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { getAdminRevenue, formatAmount, type AdminRevenue } from "@/lib/db";

export default function AdminPage() {
  const { profile } = useAuth();
  const admin = isAdminEmail(profile.email);
  const [data, setData] = useState<AdminRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Verrou par mot de passe (couche supplémentaire)
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("tontiflow_admin_ok") === "1") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!admin || !unlocked) { setLoading(false); return; }
    setLoading(true);
    getAdminRevenue()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [admin, unlocked]);

  const submitPwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd) return;
    setChecking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ password: pwd }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(j.error || "Mot de passe incorrect."); return; }
      sessionStorage.setItem("tontiflow_admin_ok", "1");
      setUnlocked(true);
    } catch {
      toast.error("Erreur de vérification.");
    } finally {
      setChecking(false);
    }
  };

  if (!admin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Accès réservé</h1>
        <p className="text-gray-500 text-sm">Cette page est réservée aux administrateurs.</p>
        <Link href="/dashboard" className="inline-block px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto py-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">Espace administrateur</h1>
          <p className="text-sm text-gray-500 mb-6">Saisissez le mot de passe administrateur pour continuer.</p>
          <form onSubmit={submitPwd} className="space-y-3">
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Mot de passe"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-center"
            />
            <button
              type="submit"
              disabled={checking || !pwd}
              className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center"
            >
              {checking ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Déverrouiller"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const cur = profile.currency || "FCFA";
  const cards = [
    { label: "Revenus aujourd'hui", value: formatAmount(data?.today ?? 0, cur), icon: CalendarDays, color: "bg-emerald-50 text-emerald-600" },
    { label: "Revenus ce mois", value: formatAmount(data?.month ?? 0, cur), icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
    { label: "Revenus totaux (frais)", value: formatAmount(data?.total ?? 0, cur), icon: Wallet, color: "bg-purple-50 text-purple-600" },
    { label: "Nombre de transactions", value: String(data?.tx_count ?? 0), icon: Receipt, color: "bg-orange-50 text-orange-600" },
    { label: "Montant total traité", value: formatAmount(data?.total_processed ?? 0, cur), icon: BarChart3, color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration · Revenus</h1>
        <p className="text-gray-500 mt-0.5">Frais de service collectés sur les dépôts confirmés.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
          Impossible de charger les revenus. Vérifiez que la migration des frais a bien été appliquée.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "—" : c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Les revenus correspondent à la somme des <strong>frais de service</strong> (platform_fee) des paiements au statut « COMPLETED ».
      </p>
    </div>
  );
}
