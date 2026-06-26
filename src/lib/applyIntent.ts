// Serveur uniquement.
import type { SupabaseClient } from "@supabase/supabase-js";
import { notify } from "@/lib/notify";

function fmt(n: number, currency: string): string {
  return `${new Intl.NumberFormat("fr-FR").format(n)} ${currency}`;
}

export type PaymentIntent = {
  deposit_id: string;
  user_id: string;
  purpose: "cotisation" | "recharge";
  amount: number;
  currency: string;
  group_id: string | null;
  member_id: string | null;
  status: string;
  applied: boolean;
};

/**
 * Applique l'effet métier d'un paiement confirmé. Idempotent : à appeler
 * seulement si l'intent n'est pas déjà `applied`. Marque l'intent COMPLETED+applied.
 * NB : l'effet porte sur `amount` (cotisation / recharge), les frais sont le revenu.
 */
export async function applyIntent(client: SupabaseClient, intent: PaymentIntent): Promise<void> {
  if (intent.applied) return;

  if (intent.purpose === "cotisation" && intent.group_id && intent.member_id) {
    const { data: grp } = await client.from("groups").select("current_round, name").eq("id", intent.group_id).maybeSingle();
    await client.from("contributions").insert({
      group_id: intent.group_id,
      member_id: intent.member_id,
      amount: intent.amount,
      status: "paid",
      round: grp?.current_round ?? 1,
      paid_at: new Date().toISOString(),
    });
    await notify(client, intent.user_id, {
      type: "payment",
      title: "Cotisation payée ✅",
      detail: `Votre cotisation de ${fmt(intent.amount, intent.currency)} a été reçue${grp?.name ? ` pour « ${grp.name} »` : ""}.`,
      href: `/dashboard/groups/${intent.group_id}`,
    });
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
    await notify(client, intent.user_id, {
      type: "payment",
      title: "Solde rechargé 💰",
      detail: `Votre solde a été crédité de ${fmt(intent.amount, intent.currency)}.`,
      href: "/dashboard/profile",
    });
  }

  await client
    .from("payment_intents")
    .update({ status: "COMPLETED", applied: true })
    .eq("deposit_id", intent.deposit_id);
}
