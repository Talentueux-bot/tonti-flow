"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, CheckCircle2, Clock, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type State = "checking" | "completed" | "pending" | "failed" | "error";

function ReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const depositId = params.get("depositId");
  const [state, setState] = useState<State>("checking");
  const [purpose, setPurpose] = useState<string>("");

  useEffect(() => {
    if (!depositId) { setState("error"); return; }
    let tries = 0;
    let active = true;

    const poll = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace(`/auth/login?redirect=/payment/return?depositId=${depositId}`); return; }

      const res = await fetch(`/api/pawapay/finalize?depositId=${depositId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!active) return;

      if (data.status === "COMPLETED") { setPurpose(data.purpose); setState("completed"); return; }
      if (data.status === "FAILED") { setPurpose(data.purpose); setState("failed"); return; }

      // PENDING : on réessaie quelques fois (le mobile money peut prendre du temps)
      tries += 1;
      if (tries < 6) setTimeout(poll, 3000);
      else { setPurpose(data.purpose ?? ""); setState("pending"); }
    };

    poll();
    return () => { active = false; };
  }, [depositId, router]);

  const destination =
    purpose === "subscription" ? "/dashboard"
    : purpose === "recharge" ? "/dashboard/profile"
    : "/dashboard/groups";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm max-w-sm w-full p-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Tonti<span className="text-emerald-600">Flow</span></span>
        </Link>

        {state === "checking" && (
          <>
            <div className="flex justify-center mb-4"><span className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
            <p className="text-sm text-gray-600">Vérification de votre paiement…</p>
          </>
        )}

        {state === "completed" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-600" /></div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Paiement réussi 🎉</h1>
            <p className="text-sm text-gray-500 mb-6">Votre paiement a bien été confirmé.</p>
            <Link href={destination} className="block w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90">Continuer</Link>
          </>
        )}

        {state === "pending" && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4"><Clock className="w-8 h-8 text-orange-500" /></div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Paiement en cours</h1>
            <p className="text-sm text-gray-500 mb-6">Votre paiement est en cours de traitement. Il sera confirmé sous peu.</p>
            <Link href={destination} className="block w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Retour au tableau de bord</Link>
          </>
        )}

        {(state === "failed" || state === "error") && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4"><XCircle className="w-8 h-8 text-red-500" /></div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Paiement non abouti</h1>
            <p className="text-sm text-gray-500 mb-6">{state === "error" ? "Référence de paiement manquante." : "Le paiement a échoué ou a été annulé."}</p>
            <Link href={destination} className="block w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90">Réessayer</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>}>
      <ReturnInner />
    </Suspense>
  );
}
