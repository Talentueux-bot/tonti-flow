import { NextResponse } from "next/server";
import { getUserFromRequest, userClient, adminClient } from "@/lib/supabaseServer";
import { isAdminEmail } from "@/lib/admin";
import { processDueVerifications, approveVerification, rejectVerification } from "@/lib/verifications";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  const { data: u } = await userClient(user.token).auth.getUser();
  if (!isAdminEmail(u.user?.email)) return { error: NextResponse.json({ error: "Accès refusé." }, { status: 403 }) };
  const admin = adminClient();
  if (!admin) return { error: NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant côté serveur." }, { status: 500 }) };
  return { admin };
}

// Approuver / rejeter manuellement (l'admin réagit avant les 5 min).
export async function POST(req: Request) {
  const { admin, error } = await requireAdmin(req);
  if (error) return error;
  const { userId, action } = (await req.json().catch(() => ({}))) as { userId?: string; action?: string };
  if (!userId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }
  try {
    if (action === "approve") await approveVerification(admin!, userId);
    else await rejectVerification(admin!, userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { admin, error } = await requireAdmin(req);
  if (error) return error;

  // Validation automatique des soumissions en attente depuis > 5 min (+ email).
  await processDueVerifications(admin!);

  // Liste des soumissions de vérification.
  const { data: rows, error: listErr } = await admin!
    .from("profiles")
    .select("id, first_name, last_name, date_of_birth, country, phone, id_document_type, id_document_path, verification_status, verification_submitted_at")
    .not("verification_submitted_at", "is", null)
    .order("verification_submitted_at", { ascending: false });
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  // 3) Lien signé (temporaire) vers chaque pièce d'identité.
  const items = await Promise.all(
    (rows ?? []).map(async (r) => {
      let documentUrl: string | null = null;
      if (r.id_document_path) {
        const { data: signed } = await admin!.storage
          .from("documents")
          .createSignedUrl(r.id_document_path, 600);
        documentUrl = signed?.signedUrl ?? null;
      }
      return { ...r, documentUrl };
    })
  );

  return NextResponse.json({ items });
}
