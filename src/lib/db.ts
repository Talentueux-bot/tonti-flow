import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Frequency = "weekly" | "biweekly" | "monthly";

export type GroupRow = {
  id: string;
  owner_id: string;
  name: string;
  emoji: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: string;
  max_members: number;
  start_date: string | null;
  rotation: string;
  status: string;
  code: string;
  created_at: string;
};

export type GroupWithStats = GroupRow & {
  memberCount: number;
  paidCount: number;
  progress: number;
  isOwner: boolean;
};

export type GroupPreview = {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  currency: string;
  member_count: number;
  max_members: number;
};

export type MemberRow = {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  position: number | null;
  is_owner: boolean;
  created_at: string;
  paid: boolean;
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Hebdomadaire",
  biweekly: "Bimensuel",
  monthly: "Mensuel",
};

export function frequencyLabel(f: string): string {
  return FREQUENCY_LABELS[f] ?? "Mensuel";
}

export function formatAmount(n: number, currency = "FCFA"): string {
  return `${new Intl.NumberFormat("fr-FR").format(n)} ${currency}`;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

// ─── Tontines (groups) ───────────────────────────────────────────────────────

export async function listGroups(): Promise<GroupWithStats[]> {
  const uid = await currentUserId();
  const { data: groups, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!groups || groups.length === 0) return [];

  const ids = groups.map((g) => g.id);
  const [{ data: members }, { data: paid }] = await Promise.all([
    supabase.from("group_members").select("id, group_id").in("group_id", ids),
    supabase
      .from("contributions")
      .select("member_id, group_id")
      .eq("status", "paid")
      .in("group_id", ids),
  ]);

  return groups.map((g) => {
    const memberCount = members?.filter((m) => m.group_id === g.id).length ?? 0;
    const paidCount = paid?.filter((p) => p.group_id === g.id).length ?? 0;
    const progress = memberCount > 0 ? Math.round((paidCount / memberCount) * 100) : 0;
    return { ...(g as GroupRow), memberCount, paidCount, progress, isOwner: g.owner_id === uid };
  });
}

// ─── Rejoindre une tontine (par code) ────────────────────────────────────────

export async function findGroupByCode(code: string): Promise<GroupPreview | null> {
  const { data, error } = await supabase.rpc("find_group_by_code", {
    p_code: code.trim().toUpperCase(),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as GroupPreview) ?? null;
}

export async function joinGroupByCode(code: string, name: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_group_by_code", {
    p_code: code.trim().toUpperCase(),
    p_name: name,
  });
  if (error) throw error;
  return data as string;
}

export async function countGroups(): Promise<number> {
  const { count, error } = await supabase
    .from("groups")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function getGroup(id: string): Promise<GroupRow | null> {
  const { data, error } = await supabase.from("groups").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as GroupRow) ?? null;
}

export type NewGroupInput = {
  name: string;
  emoji: string;
  description: string;
  amount: number;
  frequency: string;
  maxMembers: number;
  startDate: string;
  rotation: string;
  ownerName: string;
  currency: string;
};

export async function createGroup(input: NewGroupInput): Promise<GroupRow> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Vous devez être connecté.");

  const { data, error } = await supabase
    .from("groups")
    .insert({
      owner_id: uid,
      name: input.name,
      emoji: input.emoji,
      description: input.description || null,
      amount: input.amount,
      currency: input.currency || "FCFA",
      frequency: input.frequency,
      max_members: input.maxMembers,
      start_date: input.startDate || null,
      rotation: input.rotation,
    })
    .select()
    .single();
  if (error) throw error;

  // Le créateur devient automatiquement le 1er membre
  await supabase.from("group_members").insert({
    group_id: data.id,
    user_id: uid,
    name: input.ownerName || "Moi",
    is_owner: true,
    position: 1,
  });

  return data as GroupRow;
}

export async function updateGroup(
  id: string,
  fields: Partial<Pick<GroupRow, "name" | "description" | "amount" | "emoji" | "status">>
): Promise<void> {
  const { error } = await supabase.from("groups").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) throw error;
}

// ─── Membres ─────────────────────────────────────────────────────────────────

export async function listMembers(groupId: string): Promise<MemberRow[]> {
  const { data: members, error } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", groupId)
    .order("position", { ascending: true });
  if (error) throw error;

  const { data: paid } = await supabase
    .from("contributions")
    .select("member_id")
    .eq("group_id", groupId)
    .eq("status", "paid");
  const paidSet = new Set((paid ?? []).map((p) => p.member_id));

  return (members ?? []).map((m) => ({ ...(m as MemberRow), paid: paidSet.has(m.id) }));
}

export async function addMember(
  groupId: string,
  name: string,
  phone: string,
  position: number
): Promise<MemberRow> {
  const { data, error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, name, phone: phone || null, position })
    .select()
    .single();
  if (error) throw error;
  return { ...(data as MemberRow), paid: false };
}

export async function setMemberPaid(
  groupId: string,
  memberId: string,
  amount: number,
  paid: boolean
): Promise<void> {
  if (paid) {
    const { error } = await supabase.from("contributions").insert({
      group_id: groupId,
      member_id: memberId,
      amount,
      status: "paid",
      paid_at: new Date().toISOString(),
    });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("contributions")
      .delete()
      .eq("group_id", groupId)
      .eq("member_id", memberId);
    if (error) throw error;
  }
}

// ─── Statistiques du tableau de bord ─────────────────────────────────────────

export type DashboardStats = {
  groups: GroupWithStats[];
  groupCount: number;
  totalManaged: number;
  pendingDue: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const groups = await listGroups();
  const { data: paid } = await supabase
    .from("contributions")
    .select("amount")
    .eq("status", "paid");
  const totalManaged = (paid ?? []).reduce((s, c) => s + Number(c.amount), 0);
  const pendingDue = groups.reduce((s, g) => s + (g.memberCount - g.paidCount), 0);
  return { groups, groupCount: groups.length, totalManaged, pendingDue };
}

export type PaymentStats = {
  totalContributed: number;
  pending: number;
};

// ─── Profil étendu (vérification + portefeuille) ─────────────────────────────

export type MyProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  plan: string;
  date_of_birth: string | null;
  id_document_type: string | null;
  id_document_path: string | null;
  withdrawal_provider: string | null;
  withdrawal_number: string | null;
  name_verified: boolean;
  balance: number;
  verification_status: string | null;
  verification_submitted_at: string | null;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) return data as MyProfile;

  // Crée le profil s'il n'existe pas encore (anciens comptes)
  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const { data: inserted, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      first_name: meta.first_name,
      last_name: meta.last_name,
      phone: meta.phone,
      country: meta.country,
    })
    .select()
    .single();
  if (error) throw error;
  return inserted as MyProfile;
}

export async function updateVerification(fields: {
  date_of_birth?: string;
  name_verified?: boolean;
  id_document_type?: string;
  id_document_path?: string;
  verification_status?: string;
  verification_submitted_at?: string;
}): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase.from("profiles").update(fields).eq("id", uid);
  if (error) throw error;
}

export async function uploadIdDocument(file: File, docType: string): Promise<string> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Non connecté");
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${uid}/piece-identite-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
  if (error) throw error;
  await updateVerification({ id_document_type: docType, id_document_path: path });
  return path;
}

export async function setWithdrawal(provider: string, number: string): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error("Non connecté");
  const { error } = await supabase
    .from("profiles")
    .update({ withdrawal_provider: provider, withdrawal_number: number })
    .eq("id", uid);
  if (error) throw error;
}

export type WalletTx = {
  id: string;
  user_id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  method: string | null;
  status: string;
  created_at: string;
};

export async function walletDeposit(amount: number, method: string): Promise<number> {
  const { data, error } = await supabase.rpc("wallet_deposit", { p_amount: amount, p_method: method });
  if (error) throw error;
  return Number(data);
}

export async function walletWithdraw(amount: number, method: string): Promise<number> {
  const { data, error } = await supabase.rpc("wallet_withdraw", { p_amount: amount, p_method: method });
  if (error) throw error;
  return Number(data);
}

export async function listWalletTransactions(): Promise<WalletTx[]> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as WalletTx[];
}

// ─── Admin : revenus (frais de service) ──────────────────────────────────────

export type AdminRevenue = {
  today: number;
  month: number;
  total: number;
  tx_count: number;
  total_processed: number;
  active_groups: number;
};

export async function getAdminRevenue(): Promise<AdminRevenue> {
  const { data, error } = await supabase.rpc("admin_overview");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    today: Number(row?.today ?? 0),
    month: Number(row?.month ?? 0),
    total: Number(row?.total ?? 0),
    tx_count: Number(row?.tx_count ?? 0),
    total_processed: Number(row?.total_processed ?? 0),
    active_groups: Number(row?.active_groups ?? 0),
  };
}

export type DailyRevenue = { day: string; revenue: number };

export async function getAdminRevenueDaily(days = 14): Promise<DailyRevenue[]> {
  const { data, error } = await supabase.rpc("admin_revenue_daily", { p_days: days });
  if (error) throw error;
  return (data ?? []).map((r: { day: string; revenue: number }) => ({
    day: r.day,
    revenue: Number(r.revenue),
  }));
}

export async function getContributions() {
  const { data, error } = await supabase
    .from("contributions")
    .select("id, amount, status, paid_at, created_at, group_id, member_id, groups(name, emoji)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
