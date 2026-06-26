import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabaseServer";
import { advanceDuePayouts } from "@/lib/rounds";

export const runtime = "nodejs";

// Job quotidien (Vercel Cron) : fait avancer les tontines dont le versement est dû.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant." }, { status: 500 });
  }
  const processed = await advanceDuePayouts(admin);
  return NextResponse.json({ processed });
}
