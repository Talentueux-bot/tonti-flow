// ─── Plan definitions ────────────────────────────────────────────────────────

export type PlanId = "free" | "pro" | "diaspora";

export const PLANS: Record<PlanId, {
  name: string;
  price: string;
  amount: number;          // montant mensuel (FCFA) facturé
  trialDays: number;       // jours d'essai gratuit
  maxGroups: number;       // -1 = illimité
  maxMembers: number;      // par groupe, -1 = illimité
  remindersPerMonth: number; // -1 = illimité
  historyMonths: number;   // -1 = illimité
}> = {
  free: {
    name: "Gratuit",
    price: "0 FCFA",
    amount: 0,
    trialDays: 0,
    maxGroups: 3,
    maxMembers: 10,
    remindersPerMonth: 10,
    historyMonths: 3,
  },
  pro: {
    name: "Pro",
    price: "7 500 FCFA/mois",
    amount: 7500,
    trialDays: 7,
    maxGroups: -1,
    maxMembers: -1,
    remindersPerMonth: -1,
    historyMonths: -1,
  },
  diaspora: {
    name: "Diaspora",
    price: "13 000 FCFA/mois",
    amount: 13000,
    trialDays: 7,
    maxGroups: -1,
    maxMembers: -1,
    remindersPerMonth: -1,
    historyMonths: -1,
  },
};

// ─── Helpers (client-side only — use in useEffect / event handlers) ──────────

export function getPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  return (localStorage.getItem("tontiflow_plan") as PlanId) ?? "free";
}

export function setPlan(plan: PlanId) {
  localStorage.setItem("tontiflow_plan", plan);
}

export function getUserGroupCount(): number {
  if (typeof window === "undefined") return 0;
  const saved = localStorage.getItem("tontiflow_groups");
  if (!saved) return 0;
  return (JSON.parse(saved) as unknown[]).length;
}

export function canCreateGroup(): boolean {
  const plan = getPlan();
  const limit = PLANS[plan].maxGroups;
  if (limit === -1) return true;
  return getUserGroupCount() < limit;
}

export function getReminderUsage(): { used: number; max: number } {
  if (typeof window === "undefined") return { used: 0, max: 10 };
  const plan = getPlan();
  const max = PLANS[plan].remindersPerMonth;
  const used = parseInt(localStorage.getItem("tontiflow_reminders_used") ?? "0", 10);
  return { used, max };
}
