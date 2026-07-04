import { NextResponse } from "next/server";
import { payoutsEnabled, pawapayConfigured } from "@/lib/pawapay";

export const runtime = "nodejs";

// Indique si les retraits (payouts) sont actuellement disponibles côté PawaPay.
export async function GET() {
  if (!pawapayConfigured()) return NextResponse.json({ enabled: false });
  const enabled = await payoutsEnabled();
  return NextResponse.json({ enabled });
}
