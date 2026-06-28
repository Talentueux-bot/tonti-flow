import { NextResponse } from "next/server";
import { getUserFromRequest, userClient } from "@/lib/supabaseServer";
import {
  createPayout, pawapayProvider, normalizeMsisdn, resolveCountry, pawapayConfigured,
} from "@/lib/pawapay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!pawapayConfigured()) {
    return NextResponse.json({ error: "PawaPay non configuré." }, { status: 500 });
  }
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { amount } = (await req.json().catch(() => ({}))) as { amount?: number };
  const amt = Number(amount);
  if (!amt || amt <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });

  const client = userClient(user.token);
  const { data: profile } = await client
    .from("profiles")
    .select("balance, withdrawal_number, withdrawal_provider, country")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  if (Number(profile.balance) < amt) return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });
  if (!profile.withdrawal_number) {
    return NextResponse.json({ error: "Ajoutez d'abord un numéro de retrait." }, { status: 400 });
  }

  const provider = pawapayProvider(profile.country, profile.withdrawal_provider);
  if (!provider) {
    return NextResponse.json(
      { error: "Opérateur de retrait non pris en charge pour l'envoi automatique. Choisissez Orange, MTN ou Free Money." },
      { status: 400 }
    );
  }

  const { currency } = resolveCountry(profile.country);
  const phoneNumber = normalizeMsisdn(profile.country, profile.withdrawal_number);
  const payoutId = crypto.randomUUID();

  // Réserve les fonds : décrémente le solde + transaction "pending".
  await client.from("profiles").update({ balance: Number(profile.balance) - amt }).eq("id", user.id);
  await client.from("wallet_transactions").insert({
    user_id: user.id,
    type: "withdrawal",
    amount: amt,
    method: profile.withdrawal_provider,
    status: "pending",
    reference: payoutId,
  });

  const result = await createPayout({
    payoutId,
    phoneNumber,
    provider,
    amount: String(amt),
    currency,
    customerMessage: "Retrait TontiFlow",
  });

  if (result.status === "REJECTED") {
    // Remboursement immédiat.
    const { data: p2 } = await client.from("profiles").select("balance").eq("id", user.id).maybeSingle();
    await client.from("profiles").update({ balance: Number(p2?.balance ?? 0) + amt }).eq("id", user.id);
    await client.from("wallet_transactions").update({ status: "failed" }).eq("reference", payoutId);
    return NextResponse.json({ error: result.message || "Retrait refusé." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
