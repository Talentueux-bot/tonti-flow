"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Users, Calendar, TrendingUp, MessageCircle,
  CheckCircle, Clock, Share2, Settings, Plus, Copy, Check,
  Pencil, Save, X, Lock, CalendarClock, Send,
} from "lucide-react";
import {
  getGroup, listMembers, addMember, updateGroup, updatePayoutAt,
  frequencyLabel, formatAmount, type GroupRow, type MemberRow,
} from "@/lib/db";
import { startPawapayCheckout } from "@/lib/checkout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { waLink, waShareLink, reminderMessage, invitationMessage } from "@/lib/whatsapp";
import FeeSummary from "@/components/dashboard/FeeSummary";

export default function GroupDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [group, setGroup] = useState<GroupRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [paying, setPaying] = useState(false);
  const [confirmPay, setConfirmPay] = useState(false);
  const { user } = useAuth();

  const reload = useCallback(async () => {
    try {
      const g = await getGroup(id);
      setGroup(g);
      if (g) {
        setEditName(g.name);
        setEditDescription(g.description ?? "");
        setEditAmount(String(g.amount));
        if (g.payout_at) {
          const d = new Date(g.payout_at);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setPayoutInput(local);
        }
        setMembers(await listMembers(id));
      }
    } catch {
      toast.error("Impossible de charger la tontine.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveChanges = async () => {
    if (!group) return;
    try {
      await updateGroup(id, {
        name: editName,
        description: editDescription,
        amount: parseInt(editAmount) || 0,
      });
      setGroup({ ...group, name: editName, description: editDescription, amount: parseInt(editAmount) || 0 });
      setEditing(false);
      toast.success("Modifications enregistrées !");
    } catch {
      toast.error("Échec de l'enregistrement.");
    }
  };

  const handleAddMember = async () => {
    if (!newPhone.trim() || !group) return;
    if (members.length >= group.max_members) {
      toast.error(`Limite de ${group.max_members} membres atteinte pour cette tontine.`);
      return;
    }
    try {
      const isPhone = /[0-9+]/.test(newPhone);
      const member = await addMember(
        id,
        isPhone ? `Membre ${members.length + 1}` : newPhone.trim(),
        isPhone ? newPhone.trim() : "",
        members.length + 1
      );
      setMembers((prev) => [...prev, member]);
      setNewPhone("");
    } catch {
      toast.error("Impossible d'ajouter le membre.");
    }
  };

  const [payoutInput, setPayoutInput] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);

  const savePayout = async () => {
    if (!payoutInput) { toast.error("Choisissez une date et une heure."); return; }
    setSavingPayout(true);
    try {
      await updatePayoutAt(id, new Date(payoutInput).toISOString());
      toast.success("Date du versement enregistrée.");
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingPayout(false);
    }
  };

  const confirmPayout = async () => {
    if (!confirm("Confirmer le versement à ce bénéficiaire ? La cagnotte sera créditée sur son solde et on passe au tour suivant.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/tontine/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ groupId: id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(j.error || "Échec du versement."); return; }
      toast.success("Cagnotte créditée au bénéficiaire — tour suivant.");
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const joinLink = typeof window !== "undefined" && group ? `${window.location.origin}/join/${group.code}` : "";

  const payCotisation = async () => {
    if (!group) return;
    const mine = members.find((m) => m.user_id === user?.id) ?? members.find((m) => m.is_owner) ?? members[0];
    if (!mine) { toast.error("Aucun membre à payer."); return; }
    setPaying(true);
    try {
      await startPawapayCheckout({ purpose: "cotisation", groupId: id, memberId: mine.id });
    } catch (e) {
      toast.error((e as Error).message);
      setPaying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.code).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

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
  const progress = members.length > 0 ? Math.round((paidCount / members.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/groups" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xl font-bold text-gray-900 border-b-2 border-emerald-500 focus:outline-none bg-transparent"
            />
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
          <p className="text-sm text-gray-500 mt-0.5 truncate">{group.description || "—"} · {frequencyLabel(group.frequency)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleCopy} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Copier le lien d'invitation">
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5 text-gray-500" />}
          </button>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Modifier">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant de cotisation ({group.currency})</label>
            <input
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              type="number"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <button onClick={saveChanges} className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Enregistrer les modifications
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Pot du tour", value: formatAmount(group.amount * Math.max(members.length, 1), group.currency), color: "text-emerald-600 bg-emerald-50" },
          { icon: Users, label: "Membres", value: `${members.length}/${group.max_members}`, color: "text-blue-600 bg-blue-50" },
          { icon: Calendar, label: "Fréquence", value: frequencyLabel(group.frequency), color: "text-purple-600 bg-purple-50" },
          { icon: CheckCircle, label: "Cotisations", value: `${paidCount}/${members.length} payées`, color: "text-orange-600 bg-orange-50" },
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
          <span className="text-sm font-semibold text-gray-700">Collecte du tour</span>
          <span className="text-sm font-bold text-emerald-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full gradient-emerald rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400">
          {members.length > 0
            ? `${paidCount} membre${paidCount > 1 ? "s ont" : " a"} payé · ${members.length - paidCount} en attente`
            : "Aucun membre encore ajouté"}
        </p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Members list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Membres & cotisations</h2>
            {members.some((m) => !m.paid) && (
              <a
                href={waShareLink(
                  `Bonjour à tous 👋\nRappel : pensez à régler votre cotisation de ${formatAmount(group.amount, group.currency)} pour la tontine « ${group.name} ». Merci ! 🙏 — via TontiFlow`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700"
                title="Relancer le groupe sur WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" fill="currentColor" />
                Relancer le groupe
              </a>
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
                <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full gradient-emerald text-white text-xs font-bold flex items-center justify-center uppercase">
                      {m.name.slice(0, 2)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                      {m.position ?? "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate block">
                      {m.name}{m.is_owner ? " (vous)" : ""}
                    </span>
                    <span className="text-xs text-gray-400">{m.phone || "Membre"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">{formatAmount(group.amount, group.currency)}</span>
                    {!m.paid && m.phone && (
                      <a
                        href={waLink(m.phone, reminderMessage({
                          memberName: m.name,
                          groupName: group.name,
                          amount: group.amount,
                          currency: group.currency,
                        }))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                        title="Relancer sur WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" fill="currentColor" />
                      </a>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                        m.paid ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"
                      }`}
                      title={m.paid ? "Cotisation reçue" : "En attente de paiement"}
                    >
                      {m.paid
                        ? <><CheckCircle className="w-3 h-3" /> Payé</>
                        : <><Clock className="w-3 h-3" /> En attente</>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add member */}
          <div className="px-5 py-4 border-t border-gray-50 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                placeholder="+221 77 000 00 00 ou nom"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <button
                onClick={handleAddMember}
                disabled={!newPhone.trim()}
                className="px-3 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            {members.length > 0 && (
              <button
                onClick={() => setConfirmPay(true)}
                disabled={paying}
                className="w-full py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center"
              >
                Payer ma cotisation · Mobile Money (PawaPay)
              </button>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Invitation : code + lien */}
          <div className="gradient-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-green-400" fill="currentColor" />
              <span className="text-sm font-semibold text-white">Inviter des membres</span>
            </div>

            {/* Code unique */}
            <p className="text-emerald-200 text-[11px] mb-1.5 uppercase tracking-wide">Code de la tontine</p>
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors mb-3"
              title="Copier le code"
            >
              <span className="font-mono text-lg font-bold text-white tracking-[0.3em]">{group.code}</span>
              {copiedCode
                ? <Check className="w-4 h-4 text-green-400" />
                : <Copy className="w-4 h-4 text-emerald-200" />}
            </button>

            {/* Lien d'invitation */}
            <p className="text-emerald-200 text-[11px] mb-1.5 uppercase tracking-wide">Lien d&apos;invitation</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={joinLink}
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

            {/* Partage WhatsApp en 1 clic (lien + code pré-remplis) */}
            <a
              href={waShareLink(invitationMessage({ groupName: group.name, code: group.code, link: joinLink }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" fill="currentColor" />
              Inviter via WhatsApp
            </a>
          </div>

          {/* Versement du pot (planification) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-emerald-600" />
              Versement du pot
            </h2>
            <p className="text-xs text-gray-400 mb-2">
              Tour {group.current_round} / {members.length} · {group.payouts_done} encaissement{group.payouts_done > 1 ? "s" : ""}
            </p>

            {group.status === "completed" ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-medium">
                🎉 Tontine terminée — tous les membres ont encaissé le pot.
              </div>
            ) : (
            <>
            {(() => {
              const beneficiary = members.find((m) => m.position === group.current_round);
              return beneficiary ? (
                <p className="text-sm text-gray-700 mb-3">
                  Bénéficiaire de ce tour : <strong>{beneficiary.name}{beneficiary.is_owner ? " (vous)" : ""}</strong>
                </p>
              ) : null;
            })()}

            {group.owner_id === user?.id ? (
              group.payouts_done > 0 ? (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold text-gray-800">Calendrier verrouillé</p>
                    <p>Un bénéficiaire a déjà reçu — la date n&apos;est plus modifiable.</p>
                    {group.payout_at && <p className="mt-1">Versement prévu : {new Date(group.payout_at).toLocaleString("fr-FR")}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Date et heure du versement</label>
                  <input
                    type="datetime-local"
                    value={payoutInput}
                    onChange={(e) => setPayoutInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <button
                    onClick={savePayout}
                    disabled={savingPayout}
                    className="w-full py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {savingPayout ? "…" : "Enregistrer la date"}
                  </button>
                  <p className="text-[11px] text-gray-400">Modifiable tant qu&apos;aucun bénéficiaire n&apos;a reçu.</p>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-600">
                {group.payout_at
                  ? `Versement prévu : ${new Date(group.payout_at).toLocaleString("fr-FR")}`
                  : "Date du versement non encore définie."}
              </p>
            )}

            {group.owner_id === user?.id && (
              <button
                onClick={confirmPayout}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
              >
                <Send className="w-4 h-4" /> Versement effectué — tour suivant
              </button>
            )}
            </>
            )}
          </div>

          {/* Group info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Informations</h2>
            {[
              { label: "Fréquence", value: frequencyLabel(group.frequency) },
              { label: "Cotisation", value: formatAmount(group.amount, group.currency) },
              { label: "Membres max", value: group.max_members.toString() },
              { label: "Membres actuels", value: members.length.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation de paiement avec récapitulatif des frais */}
      {confirmPay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Payer ma cotisation</h2>
              <button onClick={() => setConfirmPay(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Tontine « {group.name} »</p>
              <FeeSummary amount={group.amount} currency={group.currency} label="Montant cotisation" />
              <p className="text-[11px] text-gray-400">
                Le total sera prélevé via Mobile Money (PawaPay). Les frais de service couvrent le fonctionnement de TontiFlow.
              </p>
              <button
                onClick={payCotisation}
                disabled={paying}
                className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center"
              >
                {paying
                  ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : "Confirmer et payer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
