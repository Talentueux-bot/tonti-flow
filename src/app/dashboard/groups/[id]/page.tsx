"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Users, Calendar, TrendingUp, MessageCircle,
  CheckCircle, Clock, Share2, Settings, Plus, Copy, Check,
  Pencil, Save, X,
} from "lucide-react";
import PaymentModal from "@/components/dashboard/PaymentModal";

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
    avatars: ["https://i.pravatar.cc/40?img=47", "https://i.pravatar.cc/40?img=8", "https://i.pravatar.cc/40?img=44"],
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
    avatars: ["https://i.pravatar.cc/40?img=56", "https://i.pravatar.cc/40?img=44", "https://i.pravatar.cc/40?img=47"],
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
    avatars: ["https://i.pravatar.cc/40?img=12", "https://i.pravatar.cc/40?img=15", "https://i.pravatar.cc/40?img=8"],
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
    avatars: ["https://i.pravatar.cc/40?img=44", "https://i.pravatar.cc/40?img=56", "https://i.pravatar.cc/40?img=47"],
  },
];

const defaultMembers: Record<string, { name: string; phone: string; avatar: string; paid: boolean; order: number }[]> = {
  "1": [
    { name: "Aminata Kouyaté", phone: "+221 77 123 45 67", avatar: "https://i.pravatar.cc/40?img=47", paid: true, order: 1 },
    { name: "Moussa Diallo", phone: "+221 70 234 56 78", avatar: "https://i.pravatar.cc/40?img=8", paid: true, order: 2 },
    { name: "Fatou Sow", phone: "+221 76 345 67 89", avatar: "https://i.pravatar.cc/40?img=44", paid: true, order: 3 },
    { name: "Ibrahima Ndiaye", phone: "+221 77 456 78 90", avatar: "https://i.pravatar.cc/40?img=15", paid: false, order: 4 },
    { name: "Mariama Traoré", phone: "+221 70 567 89 01", avatar: "https://i.pravatar.cc/40?img=56", paid: true, order: 5 },
  ],
};

export default function GroupDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [isUserGroup, setIsUserGroup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [members, setMembers] = useState<{ name: string; phone: string; avatar: string; paid: boolean; order: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const stored: Group[] = JSON.parse(localStorage.getItem("tontiflow_groups") || "[]");
    const userGroup = stored.find((g) => g.id === id);

    if (userGroup) {
      setGroup(userGroup);
      setIsUserGroup(true);
      setEditName(userGroup.name);
      setEditDescription(userGroup.description);
      setEditAmount(userGroup.amount);
      // Load members for this group
      const storedMembers = JSON.parse(localStorage.getItem(`tontiflow_members_${id}`) || "[]");
      setMembers(storedMembers);
    } else {
      const fallback = defaultGroups.find((g) => g.id === id) || null;
      setGroup(fallback);
      setIsUserGroup(false);
      if (fallback) {
        setMembers(defaultMembers[id] || []);
      }
    }
  }, [id]);

  const saveChanges = () => {
    if (!group) return;
    const updated = { ...group, name: editName, description: editDescription, amount: editAmount };
    const stored: Group[] = JSON.parse(localStorage.getItem("tontiflow_groups") || "[]");
    const index = stored.findIndex((g) => g.id === id);
    if (index !== -1) {
      stored[index] = updated;
      localStorage.setItem("tontiflow_groups", JSON.stringify(stored));
    }
    setGroup(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addMember = () => {
    if (!newPhone.trim()) return;
    const newMember = {
      name: newPhone,
      phone: newPhone,
      avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`,
      paid: false,
      order: members.length + 1,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem(`tontiflow_members_${id}`, JSON.stringify(updated));
    setNewPhone("");

    // Update member count in group
    if (isUserGroup && group) {
      const stored: Group[] = JSON.parse(localStorage.getItem("tontiflow_groups") || "[]");
      const index = stored.findIndex((g) => g.id === id);
      if (index !== -1) {
        stored[index].members = updated.length;
        localStorage.setItem("tontiflow_groups", JSON.stringify(stored));
        setGroup({ ...group, members: updated.length });
      }
    }
  };

  const togglePaid = (order: number) => {
    const updated = members.map((m) =>
      m.order === order ? { ...m, paid: !m.paid } : m
    );
    setMembers(updated);
    if (isUserGroup) {
      localStorage.setItem(`tontiflow_members_${id}`, JSON.stringify(updated));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://tontiflow.app/join/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tontine introuvable</h2>
        <p className="text-gray-500 mb-6">Ce groupe n&apos;existe pas ou a été supprimé.</p>
        <Link href="/dashboard/groups" className="px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold">
          Retour à mes tontines
        </Link>
      </div>
    );
  }

  const paidCount = members.filter((m) => m.paid).length;
  const progress = members.length > 0 ? Math.round((paidCount / members.length) * 100) : group.progress;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/groups" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-bold text-gray-900 border-b-2 border-emerald-500 focus:outline-none bg-transparent"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 truncate">{group.emoji} {group.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                group.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
              }`}>
                {group.status === "active" ? "Actif" : "Terminé"}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-0.5 truncate">{group.description} · {group.frequency}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleCopy} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Copier le lien d'invitation">
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5 text-gray-500" />}
          </button>
          {isUserGroup && !editing && (
            <button onClick={() => setEditing(true)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Modifier">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          )}
          {editing && (
            <>
              <button onClick={saveChanges} className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 transition-colors" title="Enregistrer">
                <Save className="w-5 h-5 text-emerald-600" />
              </button>
              <button onClick={() => setEditing(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Annuler">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </>
          )}
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
          <Check className="w-4 h-4" />
          Modifications enregistrées !
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-600" />
            Modifier la tontine
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant de cotisation (FCFA)</label>
            <input
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              type="number"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <button
            onClick={saveChanges}
            className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Enregistrer les modifications
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp,
            label: "Pot du mois",
            value: members.length > 0
              ? `${parseInt(group.amount.replace(/\s/g, "")) * members.length || "—"} FCFA`
              : `${group.amount} FCFA/pers.`,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            icon: Users,
            label: "Membres",
            value: `${members.length > 0 ? members.length : group.members}/${group.maxMembers}`,
            color: "text-blue-600 bg-blue-50",
          },
          {
            icon: Calendar,
            label: "Prochain versement",
            value: group.nextDate,
            color: "text-purple-600 bg-purple-50",
          },
          {
            icon: CheckCircle,
            label: "Cotisations",
            value: members.length > 0 ? `${paidCount}/${members.length} payées` : `${progress}%`,
            color: "text-orange-600 bg-orange-50",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Collecte du mois</span>
          <span className="text-sm font-bold text-emerald-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full gradient-emerald rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400">
          {members.length > 0
            ? `${paidCount} membre${paidCount > 1 ? "s ont" : " a"} payé · ${members.length - paidCount} en attente`
            : "Aucun membre encore ajouté"}
          {group.beneficiary !== "—" && ` · Bénéficiaire : `}
          {group.beneficiary !== "—" && <span className="font-semibold text-emerald-600">{group.beneficiary}</span>}
        </p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Members list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Membres & cotisations</h2>
            {members.length > 0 && (
              <button className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline">
                <MessageCircle className="w-3.5 h-3.5" />
                Relancer tous
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Aucun membre pour l&apos;instant</p>
              <p className="text-xs text-gray-400">Ajoutez des membres via WhatsApp ou par numéro ci-dessous.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {members.map((m) => (
                <div key={m.order} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="relative">
                    <Image src={m.avatar} alt={m.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                      {m.order}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate block">{m.name}</span>
                    <span className="text-xs text-gray-400">{m.phone !== m.name ? m.phone : "Membre"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">{group.amount} FCFA</span>
                    <button
                      onClick={() => togglePaid(m.order)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        m.paid ? "bg-emerald-100 hover:bg-emerald-200" : "bg-orange-100 hover:bg-orange-200"
                      }`}
                      title={m.paid ? "Marquer non payé" : "Marquer payé"}
                    >
                      {m.paid
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        : <Clock className="w-3.5 h-3.5 text-orange-500" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add member */}
          <div className="px-5 py-4 border-t border-gray-50 space-y-3">
            <div className="flex gap-2">
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMember()}
                placeholder="+221 77 000 00 00 ou nom"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                onClick={addMember}
                disabled={!newPhone.trim()}
                className="px-3 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            {members.length > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="w-full py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Payer ma cotisation · Wave / Orange Money
              </button>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* WhatsApp invite */}
          <div className="gradient-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-green-400" fill="currentColor" />
              <span className="text-sm font-semibold text-white">Inviter via WhatsApp</span>
            </div>
            <p className="text-emerald-200 text-xs mb-3">Partagez le lien pour que vos proches rejoignent en un clic.</p>
            <div className="flex gap-2 mb-3">
              <input
                readOnly
                value={`https://tontiflow.app/join/${id}`}
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white text-xs border border-white/20 truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <button className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              Partager sur WhatsApp
            </button>
          </div>

          {/* Group info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Informations</h2>
            {[
              { label: "Fréquence", value: group.frequency },
              { label: "Cotisation", value: `${group.amount} FCFA` },
              { label: "Membres max", value: group.maxMembers.toString() },
              { label: "Tour actuel", value: group.round },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
