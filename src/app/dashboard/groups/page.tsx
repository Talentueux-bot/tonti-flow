"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Users, Calendar, TrendingUp, Search, Trash2, Lock, Zap, KeyRound } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { listGroups, deleteGroup, getAccountPlan, frequencyLabel, formatAmount, type GroupWithStats } from "@/lib/db";

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planId, setPlanId] = useState<"free" | "pro" | "diaspora">("free");

  const load = useCallback(async () => {
    try {
      const data = await listGroups();
      setGroups(data);
    } catch {
      toast.error("Impossible de charger vos tontines.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAccountPlan().then(setPlanId);
    load();
  }, [load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer définitivement cette tontine ?")) return;
    try {
      await deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Tontine supprimée.");
    } catch {
      toast.error("Échec de la suppression.");
    }
  };

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = filtered.filter((g) => g.status === "active").length;
  const maxGroups = PLANS[planId].maxGroups;
  const atLimit = maxGroups !== -1 && groups.length >= maxGroups;

  return (
    <div className="space-y-7 max-w-5xl">
      {/* Limite plan gratuit */}
      {planId === "free" && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border ${
          atLimit ? "bg-orange-50 border-orange-200" : "bg-emerald-50 border-emerald-100"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              atLimit ? "bg-orange-100" : "bg-emerald-100"
            }`}>
              {atLimit ? <Lock className="w-4 h-4 text-orange-600" /> : <Zap className="w-4 h-4 text-emerald-600" />}
            </div>
            <div>
              <p className={`text-sm font-semibold ${atLimit ? "text-orange-800" : "text-emerald-900"}`}>
                Plan Gratuit — {groups.length}/{maxGroups} groupes utilisés
              </p>
              <p className={`text-xs mt-0.5 ${atLimit ? "text-orange-600" : "text-emerald-600"}`}>
                {atLimit
                  ? "Limite atteinte. Passez au plan Pro pour créer des groupes illimités."
                  : `Il vous reste ${maxGroups - groups.length} groupe${maxGroups - groups.length > 1 ? "s" : ""} sur votre plan gratuit`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tontines</h1>
          <p className="text-gray-500 mt-0.5">
            {filtered.length} groupe{filtered.length > 1 ? "s" : ""} · {activeCount} actif{activeCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/groups/join"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm border border-emerald-100"
          >
            <KeyRound className="w-4 h-4" />
            Rejoindre
          </Link>
          {atLimit ? (
            <button
              disabled
              title="Limite atteinte — passez au plan Pro"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-400 bg-gray-100 text-sm cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Nouvelle tontine
            </button>
          ) : (
            <Link
              href="/dashboard/groups/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 text-sm shadow-md shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tontine
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une tontine..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        /* État vide — nouveau compte */
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-4 text-3xl">🤝</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Aucune tontine pour l&apos;instant</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Créez votre première tontine et invitez vos proches pour commencer à cotiser ensemble.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/dashboard/groups/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 shadow-md shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              Créer ma première tontine
            </Link>
            <Link
              href="/dashboard/groups/join"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
            >
              <KeyRound className="w-4 h-4" />
              Rejoindre avec un code
            </Link>
          </div>
        </div>
      ) : (
        /* Cards */
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((g) => (
            <Link
              key={g.id}
              href={`/dashboard/groups/${g.id}`}
              className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                      {g.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{g.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{g.description || frequencyLabel(g.frequency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      g.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {g.status === "active" ? "Actif" : "Terminé"}
                    </span>
                    {g.isOwner ? (
                      <button
                        onClick={(e) => handleDelete(g.id, e)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">Membre</span>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-xl bg-gray-50">
                    <Users className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{g.memberCount}/{g.max_members}</p>
                    <p className="text-[11px] text-gray-400">membres</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-gray-50">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{new Intl.NumberFormat("fr-FR").format(g.amount)}</p>
                    <p className="text-[11px] text-gray-400">{g.currency}</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-gray-50">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{frequencyLabel(g.frequency)}</p>
                    <p className="text-[11px] text-gray-400">fréquence</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Cotisations collectées</span>
                    <span className="font-semibold text-gray-700">{g.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full gradient-emerald rounded-full transition-all" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {g.paidCount}/{g.memberCount} cotisation{g.memberCount > 1 ? "s" : ""} payée{g.paidCount > 1 ? "s" : ""}
                </span>
                <span className="text-xs font-semibold text-emerald-600">{formatAmount(g.amount * g.memberCount, g.currency)} / tour</span>
              </div>
            </Link>
          ))}

          {/* New group card */}
          {!atLimit && (
            <Link
              href="/dashboard/groups/new"
              className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 flex flex-col items-center justify-center p-10 gap-3 group min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center transition-all">
                <Plus className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 group-hover:text-emerald-700">Créer une tontine</p>
                <p className="text-sm text-gray-400 mt-0.5">Invitez vos proches via WhatsApp</p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
