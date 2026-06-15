import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Statut final d'un payout (retrait). Le flux retrait n'est pas encore branché
// sur PawaPay ; on accuse réception pour éviter les renvois.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.log("[pawapay/payouts] callback", body?.payoutId ?? body?.data?.payoutId, body?.status ?? body?.data?.status);
  return NextResponse.json({ received: true });
}
