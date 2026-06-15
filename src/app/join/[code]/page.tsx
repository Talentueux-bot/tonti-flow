"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { joinGroupByCode } from "@/lib/db";

export default function JoinByLinkPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string)?.toUpperCase() ?? "";
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Connexion à la tontine…");

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        // Pas connecté → on redirige vers la connexion puis on revient ici
        router.replace(`/auth/login?redirect=/join/${code}`);
        return;
      }
      try {
        const { data: userData } = await supabase.auth.getUser();
        const meta = (userData.user?.user_metadata ?? {}) as Record<string, string>;
        const name = meta.full_name || `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim() || "Membre";
        const groupId = await joinGroupByCode(code, name);
        router.replace(`/dashboard/groups/${groupId}`);
      } catch (e) {
        const msg = (e as { message?: string })?.message ?? "";
        setMessage(
          msg.includes("GROUP_NOT_FOUND")
            ? "Aucune tontine ne correspond à ce code."
            : "Impossible de rejoindre la tontine. Réessayez."
        );
        setStatus("error");
      }
    })();
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-sm w-full p-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Tonti<span className="text-emerald-600">Flow</span>
          </span>
        </Link>

        {status === "loading" ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-600 mb-2">{message}</p>
            <div className="flex justify-center mt-3">
              <span className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
            <p className="text-xs text-gray-400 mt-4">Code : <span className="font-mono font-bold tracking-widest">{code}</span></p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Oups</p>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link href="/dashboard/groups/join" className="block w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 mb-2">
              Réessayer avec un code
            </Link>
            <Link href="/dashboard" className="block w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Retour au tableau de bord
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
