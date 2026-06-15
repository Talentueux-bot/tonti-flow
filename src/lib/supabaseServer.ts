// Serveur uniquement.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Client agissant au nom de l'utilisateur connecté (RLS appliquée via son JWT). */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client admin (service_role) — RLS contournée. Seulement si la clé est configurée. */
export function adminClient(): SupabaseClient | null {
  if (!serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Récupère l'utilisateur à partir du header Authorization d'une requête. */
export async function getUserFromRequest(req: Request): Promise<{ id: string; token: string } | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const client = userClient(token);
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, token };
}
