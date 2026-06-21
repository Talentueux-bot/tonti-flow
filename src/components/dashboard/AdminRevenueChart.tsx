"use client";

import { formatAmount, type DailyRevenue } from "@/lib/db";

function fmtDay(day: string) {
  return new Date(day).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export default function AdminRevenueChart({
  data,
  currency,
}: {
  data: DailyRevenue[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div>
      <div className="flex items-end gap-1 h-44">
        {data.map((d) => {
          const h = (d.revenue / max) * 100;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end h-full"
              title={`${fmtDay(d.day)} · ${formatAmount(d.revenue, currency)}`}
            >
              <div
                className={`w-full rounded-t transition-all ${d.revenue > 0 ? "gradient-emerald" : "bg-gray-100"}`}
                style={{ height: `${Math.max(h, 2)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={d.day} className="flex-1 text-center text-[9px] text-gray-400">
            {i % 2 === 0 || data.length <= 10 ? fmtDay(d.day) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
