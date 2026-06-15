// Serveur uniquement.
import type { SupabaseClient } from "@supabase/supabase-js";

export type PaymentIntent = {
  deposit_id: string;
  user_id: string;
  purpose: "cotisation" | "subscription" | "recharge";
  amount: number;
  currency: string;
  group_id: string | null;
  member_id: string | null;
  plan: string | null;
  status: string;
  applied: boolean;
};

/**
 * Applique l'effet métier d'un paiement confirmé. Idempotent : à appeler
 * seulement si l'intent n'est pas déjà `applied`. Marque l'intent COMPLETED+applied.
 */
export async function applyIntent(client: SupabaseClient, intent: PaymentIntent): Promise<void> {
  if (intent.applied) return;

  if (intent.purpose === "cotisation" && intent.group_id && intent.member_id) {
    await client.from("contributions").insert({
      group_id: intent.group_id,
      member_id: intent.member_id,
      amount: intent.amount,
      status: "paid",
      paid_at: new Date().toISOString(),
    });
  } else if (intent.purpose === "subscription" && intent.plan) {
    await client.from("profiles").update({ plan: intent.plan }).eq("id", intent.user_id);
  } else if (intent.purpose === "recharge") {
    const { data: prof } = await client.from("profiles").select("balance").eq("id", intent.user_id).single();
    const newBalance = Number(prof?.balance ?? 0) + Number(intent.amount);
    await client.from("profiles").update({ balance: newBalance }).eq("id", intent.user_id);
    await client.from("wallet_transactions").insert({
      user_id: intent.user_id,
      type: "deposit",
      amount: intent.amount,
      method: "pawapay",
    });
  }

  await client
    .from("payment_intents")
    .update({ status: "COMPLETED", applied: true })
    .eq("deposit_id", intent.deposit_id);
}
