"use client";

import { feeBreakdown } from "@/lib/fees";
import { formatAmount } from "@/lib/db";

/**
 * Récapitulatif professionnel des frais avant paiement :
 *   Montant      : X
 *   Frais        : Y
 *   Total à payer: X + Y
 */
export default function FeeSummary({
  amount,
  currency,
  label = "Montant cotisation",
}: {
  amount: number;
  currency: string;
  label?: string;
}) {
  const { fee, total } = feeBreakdown(amount);
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 divide-y divide-gray-200 text-sm overflow-hidden">
      <div className="flex justify-between px-4 py-2.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-800">{formatAmount(amount, currency)}</span>
      </div>
      <div className="flex justify-between px-4 py-2.5">
        <span className="text-gray-500">Frais de service TontiFlow</span>
        <span className="font-medium text-gray-800">{formatAmount(fee, currency)}</span>
      </div>
      <div className="flex justify-between px-4 py-3 bg-emerald-50">
        <span className="font-semibold text-emerald-900">Total à payer</span>
        <span className="font-bold text-emerald-700">{formatAmount(total, currency)}</span>
      </div>
    </div>
  );
}
