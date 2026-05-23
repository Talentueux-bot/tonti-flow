import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp, Users, CreditCard, ArrowUpRight,
  Plus, Bell, CheckCircle, Clock, AlertCircle,
} from "lucide-react";

const statCards = [
  {
    label: "Total géré",
    value: "1 240 000 FCFA",
    change: "+12%",
    positive: true,
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Mes tontines",
    value: "4 groupes",
    change: "+1 ce mois",
    positive: true,
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Cotisations dues",
    value: "2 en attente",
    change: "Avant le 25 juin",
    positive: false,
    icon: CreditCard,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Score de confiance",
    value: "4.8 / 5",
    change: "Excellent",
    positive: true,
    icon: CheckCircle,
    color: "bg-purple-50 text-purple-600",
  },
];

const groups = [
  {
    id: "1",
    name: "Famille Diallo",
    emoji: "🇸🇳",
    members: 12,
    amount: "30 000",
    progress: 83,
    nextDate: "25 juin",
    beneficiary: "Aminata K.",
    status: "active",
    myTurn: false,
  },
  {
    id: "2",
    name: "Commerçantes Marché HLM",
    emoji: "👩‍🤝‍👩",
    members: 8,
    amount: "50 000",
    progress: 50,
    nextDate: "30 juin",
    beneficiary: "Vous",
    status: "active",
    myTurn: true,
  },
  {
    id: "3",
    name: "Association Diaspora Paris",
    emoji: "🇫🇷",
    members: 20,
    amount: "100 €",
    progress: 65,
    nextDate: "1 juillet",
    beneficiary: "Jean-Pierre M.",
    status: "active",
    myTurn: false,
  },
];

const activity = [
  {
    type: "paid",
    icon: CheckCircle,
    text: "Cotisation payée — Famille Diallo",
    amount: "+30 000 FCFA",
    time: "Il y a 2h",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    type: "reminder",
    icon: Bell,
    text: "Rappel WhatsApp envoyé — Marché HLM",
    amount: "8 membres",
    time: "Il y a 5h",
    color: "text-blue-600 bg-blue-50",
  },
  {
    type: "pending",
    icon: Clock,
    text: "Cotisation en attente — Diaspora Paris",
    amount: "100 €",
    time: "Hier",
    color: "text-orange-600 bg-orange-50",
  },
  {
    type: "alert",
    icon: AlertCircle,
    text: "Ibrahima N. n'a pas encore payé",
    amount: "30 000 FCFA",
    time: "Il y a 2 jours",
    color: "text-red-500 bg-red-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, Aminata 👋
          </h1>
          <p className="text-gray-500 mt-0.5">
            Vendredi 23 mai 2026 · Voici votre tableau de bord
          </p>
        </div>
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
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                s.positive ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
              }`}>
                {s.change}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Groups list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Mes tontines actives</h2>
            <Link href="/dashboard/groups" className="text-xs text-emerald-600 hover:underline font-medium flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

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
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{g.name}</p>
                    {g.myTurn && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                        Votre tour !
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{g.members} membres · {g.amount} FCFA</span>
                  </div>
                  {/* Mini progress */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-emerald rounded-full"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{g.progress}%</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-700">{g.nextDate}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{g.beneficiary}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Add group CTA */}
          <div className="px-6 py-4 border-t border-gray-50">
            <Link
              href="/dashboard/groups/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer une nouvelle tontine
            </Link>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Activité récente</h2>
            <Bell className="w-4 h-4 text-gray-400" />
          </div>

          <div className="divide-y divide-gray-50">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`w-7 h-7 rounded-xl ${a.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <a.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 leading-snug">{a.text}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-600 font-semibold">{a.amount}</span>
                    <span className="text-[11px] text-gray-400">· {a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next beneficiary banner */}
      <div className="gradient-dark rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="https://i.pravatar.cc/48?img=47"
            alt="Bénéficiaire"
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-400"
          />
          <div>
            <p className="text-emerald-400 text-xs font-semibold mb-0.5">Prochain versement — Marché HLM</p>
            <p className="text-white font-bold text-lg">Vous recevrez 400 000 FCFA</p>
            <p className="text-emerald-200 text-sm">Le 30 juin 2026 · Dans 7 jours</p>
          </div>
        </div>
        <Link
          href="/dashboard/payments"
          className="shrink-0 px-5 py-2.5 rounded-xl font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors text-sm"
        >
          Voir les paiements →
        </Link>
      </div>
    </div>
  );
}
