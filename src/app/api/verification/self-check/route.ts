import { NextResponse } from "next/server";
import { getUserFromRequest, adminClient } from "@/lib/supabaseServer";
import { approveVerification } from "@/lib/verifications";

export const runtime = "nodejs";

const FIVE_MIN_MS = 5 * 60 * 1000;

// Valide automatiquement la vérification de l'utilisateur courant si elle est
// en attente depuis plus de 5 min (et envoie l'email). Ne touche que SON compte.
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const admin = adminClient();
  if (!admin) return NextResponse.json({ status: "unknown" });

  const { data: prof } = await admin
    .from("profiles")
    .select("verification_status, verification_submitted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (prof?.verification_status === "pending" && prof.verification_submitted_at) {
    const elapsed = Date.now() - new Date(prof.verification_submitted_at).getTime();
    if (elapsed >= FIVE_MIN_MS) {
      await approveVerification(admin, user.id);
      return NextResponse.json({ status: "approved" });
    }
  }
  return NextResponse.json({ status: prof?.verification_status ?? "unverified" });
}
