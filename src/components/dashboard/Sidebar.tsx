"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { unreadNotificationCount } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/groups", icon: Users, label: "Mes Tontines" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Paiements" },
  { href: "/dashboard/profile", icon: User, label: "Profil" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

// Navigation du bas (mobile)
const bottomNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/dashboard/groups", icon: Users, label: "Tontines" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Paiements" },
  { href: "/dashboard/notifications", icon: Bell, label: "Alertes" },
  { href: "/dashboard/profile", icon: User, label: "Profil" },
];

const adminItem = { href: "/dashboard/admin", icon: ShieldCheck, label: "Admin" };

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    unreadNotificationCount().then(setNotifCount).catch(() => {});
  }, [pathname]);

  const initials =
    (profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "") ||
    profile.fullName.slice(0, 2).toUpperCase();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Tonti<span className="text-emerald-600">Flow</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {(isAdminEmail(profile.email) ? [...navItems, adminItem] : navItems).map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "gradient-emerald text-white shadow-md shadow-emerald-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
              {label}
              {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Notifications quick badge */}
      <div className="px-3 pb-3">
        <Link
          href="/dashboard/notifications"
          onClick={() => setMobileOpen(false)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === "/dashboard/notifications"
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Bell className="w-4 h-4 text-gray-400" />
          Notifications
          {notifCount > 0 && (
            <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </Link>
      </div>

      {/* User card */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-full gradient-emerald flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-100 shrink-0 uppercase">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{profile.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Se déconnecter"
            className="p-1 rounded-lg hover:bg-red-50 shrink-0"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col h-screen sticky top-0 bg-white border-r border-gray-100 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-emerald flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Tonti<span className="text-emerald-600">Flow</span>
          </span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-white h-full shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {bottomNav.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
                {href === "/dashboard/notifications" && notifCount > 0 && (
                  <span className="absolute top-1 right-1/2 translate-x-3 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
