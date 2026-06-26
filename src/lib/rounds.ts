// Serveur uniquement — rotation automatique des tontines.
import type { SupabaseClient } from "@supabase/supabase-js";
import { nextPayoutFrom } from "@/lib/schedule";

type G = {
  id: string;
  frequency: string;
  current_round: number;
  payouts_done: number;
  payout_at: string | null;
  status: string;
};

/**
 * Pour chaque tontine active dont la date de versement est échue :
 * le bénéficiaire du tour encaisse, on passe au tour suivant, on planifie la
 * prochaine échéance, et on termine quand tous les membres ont encaissé.
 * Rattrape plusieurs échéances si nécessaire.
 */
export async function advanceDuePayouts(admin: SupabaseClient): Promise<number> {
  const now = Date.now();
  const { data: groups } = await admin
    .from("groups")
    .select("id, frequency, current_round, payouts_done, payout_at, status")
    .eq("status", "active")
    .not("payout_at", "is", null)
    .lte("payout_at", new Date(now).toISOString());

  let processed = 0;
  for (const g of (groups ?? []) as G[]) {
    const { count } = await admin
      .from("group_members")
      .select("id", { count: "exact", head: true })
      .eq("group_id", g.id);
    const memberCount = count ?? 0;
    if (memberCount === 0) continue;

    let current_round = g.current_round;
    let payouts_done = g.payouts_done;
    let payout_at: string | null = g.payout_at;
    let status = g.status;
    let changed = false;

    while (payout_at && new Date(payout_at).getTime() <= now) {
      payouts_done += 1;
      current_round += 1;
      changed = true;
      if (payouts_done >= memberCount) {
        status = "completed";
        payout_at = null;
        break;
      }
      payout_at = nextPayoutFrom(new Date(payout_at), g.frequency).toISOString();
    }

    if (changed) {
      await admin
        .from("groups")
        .update({ current_round, payouts_done, payout_at, status })
        .eq("id", g.id);
      processed += 1;
    }
  }
  return processed;
}
