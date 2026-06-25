"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Users, CreditCard, ArrowUpRight,
  Plus, CheckCircle,
} from "lucide-react";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import { getDashboardStats, frequencyLabel, formatAmount, type DashboardStats } from "@/lib/db";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const groups = stats?.groups ?? [];

  const statCards = [
    {
      label: "Total géré",
      value: formatAmount(stats?.totalManaged ?? 0, profile.currency),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Mes tontines",
      value: `${stats?.groupCount ?? 0} groupe${(stats?.groupCount ?? 0) > 1 ? "s" : ""}`,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Cotisations dues",
      value: `${stats?.pendingDue ?? 0} en attente`,
      icon: CreditCard,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Cotisations payées",
      value: `${groups.reduce((s, g) => s + g.paidCount, 0)}`,
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Bannière de vérification (compte à valider) */}
      <VerificationBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <DashboardGreeting />
        <Link
          href="/dashboard/groups/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity text-sm shadow-md shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tontine
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{loading ? "—" : s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Groups list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Mes tontines actives</h2>
          <Link href="/dashboard/groups" className="text-xs text-emerald-600 hover:underline font-medium flex items-center gap-1">
            Voir tout <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="w-7 h-7 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 text-2xl">🤝</div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Vous n&apos;avez pas encore de tontine</p>
            <p className="text-xs text-gray-400 mb-5 max-w-xs">Créez votre première tontine pour voir vos statistiques apparaître ici.</p>
            <Link
              href="/dashboard/groups/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Créer une tontine
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/dashboard/groups/${g.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                  {g.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{g.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {g.memberCount} membre{g.memberCount > 1 ? "s" : ""} · {formatAmount(g.amount, g.currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full gradient-emerald rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{g.progress}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-700">{frequencyLabel(g.frequency)}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{g.paidCount}/{g.memberCount} payé</p>
                </div>
              </Link>
            ))}

            <div className="px-6 py-4">
              <Link
                href="/dashboard/groups/new"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer une nouvelle tontine
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
