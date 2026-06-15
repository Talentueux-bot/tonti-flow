import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Statut final d'un remboursement. Accusé de réception (flux non encore branché).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  console.log("[pawapay/refunds] callback", body?.refundId ?? body?.data?.refundId, body?.status ?? body?.data?.status);
  return NextResponse.json({ received: true });
}
