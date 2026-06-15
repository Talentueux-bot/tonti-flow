"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle, Clock, Users, PartyPopper } from "lucide-react";
import { getDashboardStats } from "@/lib/db";
import { useAuth } from "@/components/auth/AuthProvider";

type Notif = {
  id: string;
  icon: typeof Bell;
  title: string;
  detail: string;
  color: string;
  href?: string;
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((s) => {
        const list: Notif[] = [];

        // Bienvenue
        list.push({
          id: "welcome",
          icon: PartyPopper,
          title: `Bienvenue sur TontiFlow, ${profile.firstName || profile.fullName} 🎉`,
          detail: "Créez votre première tontine et invitez vos proches pour commencer.",
          color: "text-emerald-600 bg-emerald-50",
          href: "/dashboard/groups/new",
        });

        // Cotisations en attente par groupe
        s.groups.forEach((g) => {
          const pending = g.memberCount - g.paidCount;
          if (pending > 0) {
            list.push({
              id: `pending-${g.id}`,
              icon: Clock,
              title: `${pending} cotisation${pending > 1 ? "s" : ""} en attente`,
              detail: `Tontine « ${g.name} » — ${g.paidCount}/${g.memberCount} membre(s) ont payé.`,
              color: "text-orange-600 bg-orange-50",
              href: `/dashboard/groups/${g.id}`,
            });
          } else if (g.memberCount > 0) {
            list.push({
              id: `done-${g.id}`,
              icon: CheckCircle,
              title: `Toutes les cotisations sont payées 🎉`,
              detail: `Tontine « ${g.name} » — ${g.memberCount}/${g.memberCount} à jour.`,
              color: "text-emerald-600 bg-emerald-50",
              href: `/dashboard/groups/${g.id}`,
            });
          }

          if (g.memberCount <= 1) {
            list.push({
              id: `invite-${g.id}`,
              icon: Users,
              title: "Invitez des membres",
              detail: `La tontine « ${g.name} » n'a pas encore de membres. Partagez le lien d'invitation.`,
              color: "text-blue-600 bg-blue-50",
              href: `/dashboard/groups/${g.id}`,
            });
          }
        });

        setNotifs(list);
      })
      .finally(() => setLoading(false));
  }, [profile.firstName, profile.fullName]);

  return (
    <div className="space-y-7 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Bell className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-0.5">Vos rappels et activités récentes</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Bell className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Aucune notification</p>
          <p className="text-xs text-gray-400">Vous êtes à jour. Vos rappels apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {notifs.map((n) => {
            const content = (
              <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl ${n.color} flex items-center justify-center shrink-0`}>
                  <n.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.detail}</p>
                </div>
              </div>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} className="block">{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
