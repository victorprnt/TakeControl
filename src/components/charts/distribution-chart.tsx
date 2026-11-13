"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/formatters";
import type { EnvelopeStatus } from "@/types/finance-snapshot";

type DistributionChartProps = {
  envelopes: EnvelopeStatus[];
  selectedId: string | null;
};

export function DistributionChart({ envelopes, selectedId }: DistributionChartProps) {
  const total = envelopes.reduce((sum, envelope) => sum + envelope.allocatedCents, 0);
  const slices = envelopes
    .filter((envelope) => envelope.allocatedCents > 0)
    .map((envelope) => ({
      id: envelope.id,
      name: envelope.name,
      allocatedCents: envelope.allocatedCents,
      sharePercent: total > 0 ? Math.round((envelope.allocatedCents / total) * 100) : 0,
      color: envelope.color,
    }));

  if (slices.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Nenhum valor distribuído neste mês.</p>;
  }

  return (
    <div className="h-56 w-full min-w-0 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="allocatedCents"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive
          >
            {slices.map((slice) => (
              <Cell
                key={slice.id}
                fill={slice.color}
                fillOpacity={!selectedId || slice.id === selectedId ? 1 : 0.35}
                stroke={slice.id === selectedId ? "#253746" : "transparent"}
                strokeWidth={slice.id === selectedId ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => {
              const share = (item.payload as { sharePercent?: number }).sharePercent ?? 0;
              return [`${formatCurrency(Number(value))} · ${share}%`, "Distribuído"];
            }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E3E9EF",
              fontSize: 12,
              color: "#253746",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
