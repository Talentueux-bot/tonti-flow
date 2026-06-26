"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, Users, PartyPopper, Wallet, ShieldCheck, Gift,
} from "lucide-react";
import { listNotifications, markAllNotificationsRead, type Notification } from "@/lib/db";

const ICONS: Record<string, { icon: typeof Bell; color: string }> = {
  payment: { icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
  join: { icon: Users, color: "text-blue-600 bg-blue-50" },
  turn: { icon: Gift, color: "text-purple-600 bg-purple-50" },
  verification: { icon: ShieldCheck, color: "text-amber-600 bg-amber-50" },
  info: { icon: PartyPopper, color: "text-emerald-600 bg-emerald-50" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNotifications()
      .then((list) => {
        setNotifs(list);
        if (list.some((n) => !n.read)) markAllNotificationsRead().catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Bell className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Vos paiements, adhésions et activités</p>
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
          <p className="text-xs text-gray-400">Vos paiements et activités apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {notifs.map((n) => {
            const meta = ICONS[n.type] ?? ICONS.info;
            const Icon = meta.icon;
            const content = (
              <div className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-colors ${n.read ? "" : "bg-emerald-50/40"}`}>
                <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  {n.detail && <p className="text-xs text-gray-500 mt-0.5 break-words">{n.detail}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            return n.href ? (
              <Link key={n.id} href={n.href} className="block hover:bg-gray-50">{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
