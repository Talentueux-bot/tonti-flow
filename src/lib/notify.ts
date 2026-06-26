// Serveur uniquement — création de notifications en base.
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotifInput = {
  type: "payment" | "join" | "turn" | "verification" | "info";
  title: string;
  detail?: string;
  href?: string;
};

export async function notify(client: SupabaseClient, userId: string, n: NotifInput): Promise<void> {
  // Non bloquant : une notification ne doit jamais casser le flux métier.
  try {
    await client.from("notifications").insert({
      user_id: userId,
      type: n.type,
      title: n.title,
      detail: n.detail ?? null,
      href: n.href ?? null,
    });
  } catch (e) {
    console.warn("[notify] échec insertion notification :", (e as Error)?.message);
  }
}
