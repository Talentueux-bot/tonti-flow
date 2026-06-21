import { NextResponse } from "next/server";
import { getUserFromRequest, userClient } from "@/lib/supabaseServer";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";

// Vérifie le mot de passe admin côté serveur (jamais exposé au navigateur).
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const { data } = await userClient(user.token).auth.getUser();
  if (!isAdminEmail(data.user?.email)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "Mot de passe admin non configuré (ADMIN_PASSWORD)." }, { status: 500 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || password !== expected) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
