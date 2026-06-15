"use client";

import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/lib/plans";

type CheckoutInput =
  | { purpose: "cotisation"; groupId: string; memberId: string }
  | { purpose: "subscription"; plan: PlanId }
  | { purpose: "recharge"; amount: number };

/**
 * Lance un paiement PawaPay : appelle la route serveur (avec le JWT de session),
 * puis redirige le navigateur vers la page de paiement hébergée PawaPay.
 */
export async function startPawapayCheckout(input: CheckoutInput): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Vous devez être connecté.");

  const res = await fetch("/api/pawapay/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl) {
    throw new Error(data?.error || "Impossible d'initier le paiement.");
  }
  window.location.href = data.redirectUrl as string;
}
