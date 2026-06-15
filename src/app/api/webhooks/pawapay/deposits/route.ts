import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabaseServer";
import { applyIntent, type PaymentIntent } from "@/lib/applyIntent";

export const runtime = "nodejs";

// PawaPay POSTe le statut final d'un dépôt ici.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const depositId: string | undefined = body?.depositId ?? body?.data?.depositId;
  const status: string | undefined = body?.status ?? body?.data?.status;

  // On accuse réception immédiatement même si on ne peut pas traiter,
  // pour éviter les renvois en boucle de PawaPay.
  if (!depositId) return NextResponse.json({ received: true });

  const admin = adminClient();
  if (!admin) {
    // Pas de clé service_role : le crédit se fera au retour utilisateur (finalize).
    console.warn("[pawapay/deposits] SUPABASE_SERVICE_ROLE_KEY absent — callback ignoré, finalize prendra le relais.");
    return NextResponse.json({ received: true });
  }

  const { data: intent } = await admin
    .from("payment_intents")
    .select("*")
    .eq("deposit_id", depositId)
    .maybeSingle();

  if (intent && !(intent as PaymentIntent).applied) {
    if (status === "COMPLETED") {
      await applyIntent(admin, intent as PaymentIntent);
    } else if (status === "FAILED") {
      await admin.from("payment_intents").update({ status: "FAILED" }).eq("deposit_id", depositId);
    }
  }

  return NextResponse.json({ received: true });
}
