// Serveur uniquement — rotation automatique des tontines + crédit du bénéficiaire.
import type { SupabaseClient } from "@supabase/supabase-js";
import { nextPayoutFrom } from "@/lib/schedule";
import { notify } from "@/lib/notify";

function fmt(n: number, c: string): string {
  return `${new Intl.NumberFormat("fr-FR").format(n)} ${c}`;
}

/** Crédite le bénéficiaire du tour `round` (membre en position = round) sur son solde. */
async function creditBeneficiary(admin: SupabaseClient, groupId: string, round: number): Promise<void> {
  const { data: member } = await admin
    .from("group_members")
    .select("user_id, name")
    .eq("group_id", groupId)
    .eq("position", round)
    .maybeSingle();
  if (!member?.user_id) return; // membre sans compte → pas de crédit automatique

  // La cagnotte = somme des cotisations réellement payées pour ce tour.
  const { data: contribs } = await admin
    .from("contributions")
    .select("amount")
    .eq("group_id", groupId)
    .eq("round", round)
    .eq("status", "paid");
  const pot = (contribs ?? []).reduce((s, c) => s + Number(c.amount), 0);
  if (pot <= 0) return;

  const { data: grp } = await admin.from("groups").select("currency, name").eq("id", groupId).maybeSingle();
  const currency = grp?.currency ?? "FCFA";

  const { data: prof } = await admin.from("profiles").select("balance").eq("id", member.user_id).maybeSingle();
  const newBalance = Number(prof?.balance ?? 0) + pot;
  await admin.from("profiles").update({ balance: newBalance }).eq("id", member.user_id);
  await admin.from("wallet_transactions").insert({
    user_id: member.user_id,
    type: "deposit",
    amount: pot,
    method: "tontine",
  });
  await notify(admin, member.user_id, {
    type: "turn",
    title: "C'est votre tour 🎁",
    detail: `Vous avez reçu la cagnotte de ${fmt(pot, currency)}${grp?.name ? ` de « ${grp.name} »` : ""} sur votre solde. Vous pouvez la retirer.`,
    href: "/dashboard/profile",
  });
}

type GroupState = {
  id: string;
  frequency: string;
  current_round: number;
  payouts_done: number;
  payout_at: string | null;
  status: string;
};

/** Effectue un versement (crédite le bénéficiaire) puis passe au tour suivant. */
export async function advanceGroupOnce(
  admin: SupabaseClient,
  g: GroupState,
  memberCount: number
): Promise<GroupState> {
  await creditBeneficiary(admin, g.id, g.current_round);

  const payouts_done = g.payouts_done + 1;
  const current_round = g.current_round + 1;
  let status = "active";
  let payout_at: string | null = g.payout_at;

  if (memberCount > 0 && payouts_done >= memberCount) {
    status = "completed";
    payout_at = null;
  } else {
    payout_at = g.payout_at ? nextPayoutFrom(new Date(g.payout_at), g.frequency).toISOString() : null;
  }

  await admin
    .from("groups")
    .update({ payouts_done, current_round, status, payout_at })
    .eq("id", g.id);

  return { ...g, payouts_done, current_round, status, payout_at };
}

/** Job : fait avancer toutes les tontines actives dont la date de versement est échue. */
export async function advanceDuePayouts(admin: SupabaseClient): Promise<number> {
  const now = Date.now();
  const { data: groups } = await admin
    .from("groups")
    .select("id, frequency, current_round, payouts_done, payout_at, status")
    .eq("status", "active")
    .not("payout_at", "is", null)
    .lte("payout_at", new Date(now).toISOString());

  let processed = 0;
  for (const grp of (groups ?? []) as GroupState[]) {
    const { count } = await admin
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", grp.id);
    const memberCount = count ?? 0;
    if (memberCount === 0) continue;

    let g = grp;
    let changed = false;
    while (g.payout_at && new Date(g.payout_at).getTime() <= now && g.status === "active") {
      g = await advanceGroupOnce(admin, g, memberCount);
      changed = true;
    }
    if (changed) processed += 1;
  }
  return processed;
}
