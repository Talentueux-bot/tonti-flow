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

  const body = (await req.json().catch(() => ({}))) as { amount?: number; provider?: string; phone?: string };
  const amt = Number(body.amount);
  if (!amt || amt <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });

  const client = userClient(user.token);
  const { data: profile } = await client
    .from("profiles")
    .select("balance, withdrawal_number, withdrawal_provider, country")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  if (Number(profile.balance) < amt) return NextResponse.json({ error: "Solde insuffisant." }, { status: 400 });

  // Opérateur + numéro : ceux fournis au moment du retrait, sinon ceux enregistrés.
  const genericProvider = body.provider || profile.withdrawal_provider;
  const rawPhone = body.phone || profile.withdrawal_number;
  if (!rawPhone) return NextResponse.json({ error: "Indiquez un numéro de retrait." }, { status: 400 });

  const provider = pawapayProvider(profile.country, genericProvider);
  if (!provider) {
    return NextResponse.json(
      { error: "Opérateur non pris en charge pour l'envoi automatique. Choisissez Orange, MTN ou Free Money." },
      { status: 400 }
    );
  }

  const { currency } = resolveCountry(profile.country);
  const phoneNumber = normalizeMsisdn(profile.country, rawPhone);
  const payoutId = crypto.randomUUID();

  // Réserve les fonds : décrémente le solde + transaction "pending".
  await client.from("profiles").update({ balance: Number(profile.balance) - amt }).eq("id", user.id);
  await client.from("wallet_transactions").insert({
    user_id: user.id,
    type: "withdrawal",
    amount: amt,
    method: genericProvider,
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

    const raw = result.message || "";
    const pending = /configured to make payouts|not been configured|not configured/i.test(raw);
    const error = pending
      ? "Les retraits vers Mobile Money sont en cours d'activation et seront disponibles très bientôt. Votre solde reste en sécurité 💚"
      : raw || "Retrait refusé.";
    return NextResponse.json({ error, pending }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
