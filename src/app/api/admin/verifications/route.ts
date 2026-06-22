import { NextResponse } from "next/server";
import { getUserFromRequest, userClient, adminClient } from "@/lib/supabaseServer";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

const FIVE_MIN_MS = 5 * 60 * 1000;

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data: u } = await userClient(user.token).auth.getUser();
  if (!isAdminEmail(u.user?.email)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY manquant côté serveur." }, { status: 500 });
  }

  // 1) Validation automatique : tout ce qui est "pending" depuis > 5 min passe "approved".
  const cutoff = new Date(Date.now() - FIVE_MIN_MS).toISOString();
  await admin
    .from("profiles")
    .update({ verification_status: "approved" })
    .eq("verification_status", "pending")
    .lt("verification_submitted_at", cutoff);

  // 2) Liste des soumissions de vérification.
  const { data: rows, error } = await admin
    .from("profiles")
    .select("id, first_name, last_name, date_of_birth, country, phone, id_document_type, id_document_path, verification_status, verification_submitted_at")
    .not("verification_submitted_at", "is", null)
    .order("verification_submitted_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3) Lien signé (temporaire) vers chaque pièce d'identité.
  const items = await Promise.all(
    (rows ?? []).map(async (r) => {
      let documentUrl: string | null = null;
      if (r.id_document_path) {
        const { data: signed } = await admin.storage
          .from("documents")
          .createSignedUrl(r.id_document_path, 600);
        documentUrl = signed?.signedUrl ?? null;
      }
      return { ...r, documentUrl };
    })
  );

  return NextResponse.json({ items });
}
