"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildProfile(user: User | null): Profile {
  const meta = (user?.user_metadata ?? {}) as Record<string, string>;
  const firstName = meta.first_name ?? "";
  const lastName = meta.last_name ?? "";
  const fullName =
    meta.full_name ||
    `${firstName} ${lastName}`.trim() ||
    user?.email?.split("@")[0] ||
    "Utilisateur";
  return {
    firstName,
    lastName,
    fullName,
    email: user?.email ?? "",
    phone: meta.phone ?? "",
    country: meta.country ?? "",
  };
}

/**
 * Protège les pages enfants : vérifie la session Supabase, redirige vers
 * la connexion si aucun utilisateur, et expose l'utilisateur réel via le contexte.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/auth/login");
        return;
      }
      setUser(data.session.user);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        router.replace("/auth/login");
      } else {
        setUser(session.user);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile: buildProfile(user), signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
