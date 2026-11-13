"use client";

import { useId } from "react";
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters";
import type { DailyFlowPoint } from "@/types/finance-snapshot";

type DailyFlowChartProps = {
  points: DailyFlowPoint[];
  showPrevious: boolean;
};

export function DailyFlowChart({ points, showPrevious }: DailyFlowChartProps) {
  const rawId = useId().replace(/:/g, "");
  const spentGradient = `daily-spent-${rawId}`;

  return (
    <div className="h-56 w-full min-w-0 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={spentGradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E78A91" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E78A91" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tick={{ fill: "#8A99A8", fontSize: 11 }}
          />
          <YAxis
            width={52}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A99A8", fontSize: 11 }}
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
          />
          <Tooltip
            formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
            labelFormatter={(label) => `Dia ${String(label)}`}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E3E9EF",
              fontSize: 12,
              color: "#253746",
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeSpentCents"
            name="Despesas acumuladas"
            stroke="#E78A91"
            strokeWidth={2.5}
            fill={`url(#${spentGradient})`}
          />
          <Line
            type="monotone"
            dataKey="availableCents"
            name="Orçamento disponível"
            stroke="#64CBB1"
            strokeWidth={2.5}
            dot={false}
          />
          {showPrevious ? (
            <Line
              type="monotone"
              dataKey="previousCumulativeSpentCents"
              name="Mês anterior"
              stroke="#65B8E8"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls={false}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
