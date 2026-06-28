import { NextResponse } from "next/server";
import { getUserFromRequest, userClient, adminClient } from "@/lib/supabaseServer";
import { advanceGroupOnce } from "@/lib/rounds";

export const runtime = "nodejs";

// Le propriétaire déclenche manuellement le versement du tour (crédite le bénéficiaire).
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { groupId } = (await req.json().catch(() => ({}))) as { groupId?: string };
  if (!groupId) return NextResponse.json({ error: "groupId requis." }, { status: 400 });

  const client = userClient(user.token);
  const { data: g } = await client
    .from("groups")
    .select("id, owner_id, frequency, current_round, payouts_done, payout_at, status")
    .eq("id", groupId)
    .maybeSingle();
  if (!g) return NextResponse.json({ error: "Tontine introuvable." }, { status: 404 });
  if (g.owner_id !== user.id) return NextResponse.json({ error: "Réservé au créateur." }, { status: 403 });
  if (g.status !== "active") return NextResponse.json({ error: "Tontine déjà terminée." }, { status: 400 });

  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant." }, { status: 500 });

  const { count } = await admin
    .from("group_members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId);

  await advanceGroupOnce(
    admin,
    {
      id: g.id,
      frequency: g.frequency,
      current_round: g.current_round,
      payouts_done: g.payouts_done,
      payout_at: g.payout_at,
      status: g.status,
    },
    count ?? 0
  );

  return NextResponse.json({ ok: true });
}
