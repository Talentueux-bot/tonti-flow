// Serveur uniquement — traitement des vérifications de compte (KYC).
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, verificationApprovedHtml, verificationRejectedHtml } from "@/lib/email";

const FIVE_MIN_MS = 5 * 60 * 1000;

async function recipient(admin: SupabaseClient, userId: string): Promise<{ email: string | null; name: string }> {
  const { data } = await admin.auth.admin.getUserById(userId);
  const meta = (data.user?.user_metadata ?? {}) as Record<string, string>;
  const name = meta.first_name || meta.full_name || "cher utilisateur";
  return { email: data.user?.email ?? null, name };
}

/** Approuve une vérification + email personnalisé. */
export async function approveVerification(admin: SupabaseClient, userId: string): Promise<void> {
  await admin.from("profiles").update({ verification_status: "approved", name_verified: true }).eq("id", userId);
  const { email, name } = await recipient(admin, userId);
  if (email) await sendEmail(email, "Votre compte TontiFlow est vérifié ✅", verificationApprovedHtml(name));
}

/** Rejette une vérification + email personnalisé. */
export async function rejectVerification(admin: SupabaseClient, userId: string): Promise<void> {
  await admin.from("profiles").update({ verification_status: "rejected", name_verified: false }).eq("id", userId);
  const { email, name } = await recipient(admin, userId);
  if (email) await sendEmail(email, "Vérification TontiFlow — action requise", verificationRejectedHtml(name));
}

/** Valide automatiquement les vérifications en attente depuis plus de 5 min. */
export async function processDueVerifications(admin: SupabaseClient): Promise<number> {
  const cutoff = new Date(Date.now() - FIVE_MIN_MS).toISOString();
  const { data: due } = await admin
    .from("profiles")
    .select("id")
    .eq("verification_status", "pending")
    .lt("verification_submitted_at", cutoff);

  for (const row of due ?? []) {
    await approveVerification(admin, (row as { id: string }).id);
  }
  return (due ?? []).length;
}
