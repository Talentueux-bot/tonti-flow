import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabaseServer";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

// Statut final d'un payout (retrait). Confirme ou rembourse selon le résultat.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payoutId: string | undefined = body?.payoutId ?? body?.data?.payoutId;
  const status: string | undefined = body?.status ?? body?.data?.status;
  if (!payoutId) return NextResponse.json({ received: true });

  const admin = adminClient();
  if (!admin) return NextResponse.json({ received: true });

  const { data: tx } = await admin
    .from("wallet_transactions")
    .select("id, user_id, amount, status")
    .eq("reference", payoutId)
    .maybeSingle();
  if (!tx) return NextResponse.json({ received: true });

  if (status === "COMPLETED" && tx.status !== "completed") {
    await admin.from("wallet_transactions").update({ status: "completed" }).eq("id", tx.id);
    await notify(admin, tx.user_id, {
      type: "payment",
      title: "Retrait effectué ✅",
      detail: "Votre retrait a bien été envoyé sur votre Mobile Money.",
      href: "/dashboard/profile",
    });
  } else if ((status === "FAILED" || status === "REJECTED") && tx.status !== "failed") {
    // Remboursement du solde.
    const { data: prof } = await admin.from("profiles").select("balance").eq("id", tx.user_id).maybeSingle();
    await admin.from("profiles").update({ balance: Number(prof?.balance ?? 0) + Number(tx.amount) }).eq("id", tx.user_id);
    await admin.from("wallet_transactions").update({ status: "failed" }).eq("id", tx.id);
    await notify(admin, tx.user_id, {
      type: "info",
      title: "Retrait non abouti",
      detail: "Votre retrait n'a pas pu être envoyé. Le montant a été recrédité sur votre solde.",
      href: "/dashboard/profile",
    });
  }

  return NextResponse.json({ received: true });
}
