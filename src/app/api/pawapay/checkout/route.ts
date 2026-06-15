import { NextResponse } from "next/server";
import { getUserFromRequest, userClient } from "@/lib/supabaseServer";
import { createPaymentPage, resolveCountry, pawapayConfigured } from "@/lib/pawapay";
import { PLANS, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

type Body = {
  purpose: "cotisation" | "subscription" | "recharge";
  groupId?: string;
  memberId?: string;
  plan?: PlanId;
  amount?: number;
};

export async function POST(req: Request) {
  if (!pawapayConfigured()) {
    return NextResponse.json({ error: "PawaPay non configuré (PAWAPAY_TOKEN manquant)." }, { status: 500 });
  }

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  const client = userClient(user.token);

  // Devise / pays depuis le profil
  const { data: profile } = await client.from("profiles").select("country").eq("id", user.id).maybeSingle();
  const { country, currency } = resolveCountry(profile?.country);

  // Montant fiable côté serveur selon le but
  let amount = 0;
  let reason = "Paiement TontiFlow";
  let groupId: string | null = null;
  let memberId: string | null = null;
  let plan: string | null = null;

  if (body.purpose === "cotisation") {
    if (!body.groupId || !body.memberId) {
      return NextResponse.json({ error: "groupId/memberId requis." }, { status: 400 });
    }
    const { data: group } = await client.from("groups").select("amount, name").eq("id", body.groupId).maybeSingle();
    if (!group) return NextResponse.json({ error: "Tontine introuvable." }, { status: 404 });
    amount = Number(group.amount);
    reason = `Cotisation ${group.name}`.slice(0, 60);
    groupId = body.groupId;
    memberId = body.memberId;
  } else if (body.purpose === "subscription") {
    if (!body.plan || !(body.plan in PLANS)) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }
    amount = PLANS[body.plan].amount;
    reason = `Abonnement ${PLANS[body.plan].name}`;
    plan = body.plan;
  } else if (body.purpose === "recharge") {
    amount = Number(body.amount);
    if (!amount || amount <= 0) return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
    reason = "Recharge du solde";
  } else {
    return NextResponse.json({ error: "Purpose invalide." }, { status: 400 });
  }

  const depositId = crypto.randomUUID();

  // Enregistre l'intention de paiement (RLS : l'utilisateur ne crée que les siennes)
  const { error: insErr } = await client.from("payment_intents").insert({
    deposit_id: depositId,
    user_id: user.id,
    purpose: body.purpose,
    amount,
    currency,
    group_id: groupId,
    member_id: memberId,
    plan,
    status: "PENDING",
  });
  if (insErr) return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const returnUrl = `${origin}/payment/return?depositId=${depositId}`;

  try {
    const { redirectUrl } = await createPaymentPage({
      depositId,
      amount: String(amount),
      currency,
      country,
      reason,
      returnUrl,
    });
    return NextResponse.json({ redirectUrl, depositId });
  } catch (e) {
    await client.from("payment_intents").update({ status: "FAILED" }).eq("deposit_id", depositId);
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
