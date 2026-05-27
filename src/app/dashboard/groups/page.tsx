"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Users, Calendar, TrendingUp, Search, Filter, Trash2, Lock, Zap } from "lucide-react";
import { getPlan, getUserGroupCount, PLANS } from "@/lib/plans";

type Group = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  members: number;
  maxMembers: number;
  amount: string;
  frequency: string;
  progress: number;
  nextDate: string;
  beneficiary: string;
  round: string;
  status: string;
  myTurn: boolean;
  avatars: string[];
  createdAt?: string;
};

const defaultGroups: Group[] = [
  {
    id: "1",
    name: "Famille Diallo",
    emoji: "🇸🇳",
    description: "Tontine familiale mensuelle",
    members: 12,
    maxMembers: 12,
    amount: "30 000",
    frequency: "Mensuel",
    progress: 83,
    nextDate: "25 juin 2026",
    beneficiary: "Aminata K.",
    round: "8/12",
    status: "active",
    myTurn: false,
    avatars: [
      "https://i.pravatar.cc/32?img=47",
      "https://i.pravatar.cc/32?img=8",
      "https://i.pravatar.cc/32?img=44",
    ],
  },
  {
    id: "2",
    name: "Commerçantes Marché HLM",
    emoji: "👩‍🤝‍👩",
    description: "Groupe de commerçantes du marché HLM",
    members: 8,
    maxMembers: 10,
    amount: "50 000",
    frequency: "Mensuel",
    progress: 50,
    nextDate: "30 juin 2026",
    beneficiary: "Vous",
    round: "4/8",
    status: "active",
    myTurn: true,
    avatars: [
      "https://i.pravatar.cc/32?img=56",
      "https://i.pravatar.cc/32?img=44",
      "https://i.pravatar.cc/32?img=47",
    ],
  },
  {
    id: "3",
    name: "Association Diaspora Paris",
    emoji: "🇫🇷",
    description: "Diaspora africaine en France",
    members: 20,
    maxMembers: 20,
    amount: "100",
    frequency: "Mensuel",
    progress: 65,
    nextDate: "1 juillet 2026",
    beneficiary: "Jean-Pierre M.",
    round: "13/20",
    status: "active",
    myTurn: false,
    avatars: [
      "https://i.pravatar.cc/32?img=12",
      "https://i.pravatar.cc/32?img=15",
      "https://i.pravatar.cc/32?img=8",
    ],
  },
  {
    id: "4",
    name: "Tontine Étudiantes UCAD",
    emoji: "🎓",
    description: "Étudiantes de l'Université Cheikh Anta Diop",
    members: 6,
    maxMembers: 10,
    amount: "15 000",
    frequency: "Hebdomadaire",
    progress: 100,
    nextDate: "Terminée",
    beneficiary: "—",
    round: "6/6",
    status: "completed",
    myTurn: false,
    avatars: [
      "https://i.pravatar.cc/32?img=44",
      "https://i.pravatar.cc/32?img=56",
      "https://i.pravatar.cc/32?img=47",
    ],
  },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(defaultGroups);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("tontiflow_groups");
    if (saved) {
      const parsed: Group[] = JSON.parse(saved);
      setGroups([...parsed, ...defaultGroups]);
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved: Group[] = JSON.parse(localStorage.getItem("tontiflow_groups") || "[]");
    const updated = saved.filter((g) => g.id !== id);
    localStorage.setItem("tontiflow_groups", JSON.stringify(updated));
    setGroups([...updated, ...defaultGroups]);
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = filtered.filter((g) => g.status === "active").length;

  return (
    <div className="space-y-7 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tontines</h1>
          <p className="text-gray-500 mt-0.5">
            {filtered.length} groupe{filtered.length > 1 ? "s" : ""} · {activeCount} actif{activeCount > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/groups/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 text-sm shadow-md shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          Nouvelle tontine
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une tontine..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-emerald-400 transition-colors">
          <Filter className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {filtered.map((g) => (
          <Link
            key={g.id}
            href={`/dashboard/groups/${g.id}`}
            className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
          >
            {/* Card top */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                    {g.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{g.name}</h3>
                      {g.myTurn && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                          Votre tour !
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    g.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {g.status === "active" ? "Actif" : "Terminé"}
                  </span>
                  {/* Delete button for user-created groups */}
                  {g.createdAt && (
                    <button
                      onClick={(e) => handleDelete(g.id, e)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-xl bg-gray-50">
                  <Users className="w-3.5 h-3.5 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-900">{g.members}/{g.maxMembers}</p>
                  <p className="text-[11px] text-gray-400">membres</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-gray-50">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-900">{g.amount}</p>
                  <p className="text-[11px] text-gray-400">FCFA/mois</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-gray-50">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-gray-900">{g.round}</p>
                  <p className="text-[11px] text-gray-400">tour</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Cotisations collectées</span>
                  <span className="font-semibold text-gray-700">{g.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-emerald rounded-full transition-all"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex -space-x-1.5">
                {g.avatars.slice(0, 3).map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
                {g.members > 3 && (
                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                    +{g.members - 3}
                  </div>
                )}
              </div>

              <div className="text-right">
                {g.status === "active" ? (
                  <>
                    <p className="text-xs font-semibold text-gray-700">{g.nextDate}</p>
                    <p className="text-[11px] text-emerald-600">→ {g.beneficiary}</p>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Cycle terminé ✓</span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {/* New group card */}
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
      </div>
    </div>
  );
}
