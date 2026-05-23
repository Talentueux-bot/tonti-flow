import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, Calendar, TrendingUp, MessageCircle, CheckCircle, Clock, Share2, Settings } from "lucide-react";

const members = [
  { name: "Aminata Kouyaté", phone: "+221 77 123 45 67", avatar: "https://i.pravatar.cc/40?img=47", paid: true, amount: "30 000", isMe: true, order: 1 },
  { name: "Moussa Diallo", phone: "+221 70 234 56 78", avatar: "https://i.pravatar.cc/40?img=8", paid: true, amount: "30 000", isMe: false, order: 2 },
  { name: "Fatou Sow", phone: "+221 76 345 67 89", avatar: "https://i.pravatar.cc/40?img=44", paid: true, amount: "30 000", isMe: false, order: 3 },
  { name: "Ibrahima Ndiaye", phone: "+221 77 456 78 90", avatar: "https://i.pravatar.cc/40?img=15", paid: false, amount: "30 000", isMe: false, order: 4 },
  { name: "Mariama Traoré", phone: "+221 70 567 89 01", avatar: "https://i.pravatar.cc/40?img=56", paid: true, amount: "30 000", isMe: false, order: 5 },
];

const history = [
  { month: "Mai 2026", beneficiary: "Moussa D.", amount: "360 000", status: "paid" },
  { month: "Avril 2026", beneficiary: "Aminata K. (vous)", amount: "360 000", status: "paid" },
  { month: "Mars 2026", beneficiary: "Fatou S.", amount: "360 000", status: "paid" },
];

export default function GroupDetailPage() {
  const paidCount = members.filter((m) => m.paid).length;
  const progress = Math.round((paidCount / members.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/groups" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Famille Diallo 🇸🇳</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Actif</span>
          </div>
          <p className="text-sm text-gray-500">Tontine familiale mensuelle · Créée en janvier 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Pot du mois", value: "360 000 FCFA", color: "text-emerald-600 bg-emerald-50" },
          { icon: Users, label: "Membres", value: `${members.length}/12`, color: "text-blue-600 bg-blue-50" },
          { icon: Calendar, label: "Prochain versement", value: "25 juin", color: "text-purple-600 bg-purple-50" },
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
          <span className="text-sm font-semibold text-gray-700">Collecte du mois de juin</span>
          <span className="text-sm font-bold text-emerald-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full gradient-emerald rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400">
          {paidCount} membres ont payé · {members.length - paidCount} en attente · Bénéficiaire : <span className="font-semibold text-emerald-600">Aminata K.</span>
        </p>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Members list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Membres & cotisations</h2>
            <button className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline">
              <MessageCircle className="w-3.5 h-3.5" />
              Relancer tous
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {members.map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-3.5">
                <div className="relative">
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                    {m.order}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{m.name}</span>
                    {m.isMe && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Vous</span>}
                  </div>
                  <span className="text-xs text-gray-400">{m.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">{m.amount} FCFA</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    m.paid ? "bg-emerald-100" : "bg-orange-100"
                  }`}>
                    {m.paid
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      : <Clock className="w-3.5 h-3.5 text-orange-500" />
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-gray-50">
            <button className="w-full py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Payer ma cotisation · Wave / Orange Money
            </button>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Historique des versements</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((h) => (
                <div key={h.month} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{h.beneficiary}</p>
                    <p className="text-xs text-gray-400">{h.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{h.amount} FCFA</p>
                    <span className="text-[11px] text-emerald-500">✓ Versé</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp invite */}
          <div className="gradient-dark rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-green-400" fill="currentColor" />
              <span className="text-sm font-semibold text-white">Inviter via WhatsApp</span>
            </div>
            <p className="text-emerald-200 text-xs mb-3">Ajoutez des membres manquants</p>
            <button className="w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
              Partager le lien d&apos;invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
