import { NextResponse } from "next/server";
import { getUserFromRequest, userClient } from "@/lib/supabaseServer";
import { getDepositStatus } from "@/lib/pawapay";
import { applyIntent, type PaymentIntent } from "@/lib/applyIntent";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const depositId = new URL(req.url).searchParams.get("depositId");
  if (!depositId) return NextResponse.json({ error: "depositId requis." }, { status: 400 });

  const client = userClient(user.token);
  const { data: intent } = await client
    .from("payment_intents")
    .select("*")
    .eq("deposit_id", depositId)
    .maybeSingle();

  if (!intent) return NextResponse.json({ error: "Paiement introuvable." }, { status: 404 });
  const typed = intent as PaymentIntent;

  // Déjà traité
  if (typed.applied || typed.status === "COMPLETED") {
    return NextResponse.json({ status: "COMPLETED", purpose: typed.purpose });
  }

  const status = await getDepositStatus(depositId);

  if (status === "COMPLETED") {
    await applyIntent(client, typed);
    return NextResponse.json({ status: "COMPLETED", purpose: typed.purpose });
  }
  if (status === "FAILED") {
    await client.from("payment_intents").update({ status: "FAILED" }).eq("deposit_id", depositId);
    return NextResponse.json({ status: "FAILED", purpose: typed.purpose });
  }
  // ACCEPTED / PROCESSING / IN_RECONCILIATION / UNKNOWN
  return NextResponse.json({ status: "PENDING", purpose: typed.purpose });
}
