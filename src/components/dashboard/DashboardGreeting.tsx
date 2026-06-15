"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardGreeting() {
  const { profile } = useAuth();
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Bonjour, {profile.firstName || profile.fullName} 👋
      </h1>
      <p className="text-gray-500 mt-0.5 first-letter:uppercase">
        {today} · Voici votre tableau de bord
      </p>
    </div>
  );
}
