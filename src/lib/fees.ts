// Système centralisé de frais de service TontiFlow.
// Paliers appliqués sur le MONTANT du dépôt :
//   <= 20 000 FCFA      → 5%
//   20 001 – 100 000    → 4%
//   > 100 000           → 3%

export const FEE_TIERS = [
  { upTo: 20000, rate: 0.05, label: "≤ 20 000 FCFA" },
  { upTo: 100000, rate: 0.04, label: "20 001 – 100 000 FCFA" },
  { upTo: Infinity, rate: 0.03, label: "> 100 000 FCFA" },
] as const;

/** Taux applicable à un montant donné. */
export function feeRate(amount: number): number {
  if (!amount || amount <= 0) return 0;
  if (amount <= 20000) return 0.05;
  if (amount <= 100000) return 0.04;
  return 0.03;
}

/** Frais de service (arrondi au FCFA entier). */
export function calculateFee(amount: number): number {
  if (!amount || amount <= 0) return 0;
  return Math.round(amount * feeRate(amount));
}

export type FeeBreakdown = {
  amount: number; // cotisation / montant déposé
  fee: number; // frais de service
  total: number; // total à payer
  rate: number; // taux appliqué
};

/** Décompose un montant en cotisation + frais + total à payer. */
export function feeBreakdown(amount: number): FeeBreakdown {
  const fee = calculateFee(amount);
  return { amount, fee, total: amount + fee, rate: feeRate(amount) };
}
