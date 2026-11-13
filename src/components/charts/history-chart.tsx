"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { HistoryPoint } from "@/types/finance-snapshot";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters";

type HistoryChartProps = {
  points: HistoryPoint[];
};

export function HistoryChart({ points }: HistoryChartProps) {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `spent-${rawId}`;

  return (
    <div className="h-64 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64CBB1" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#64CBB1" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A99A8", fontSize: 11 }}
            interval={0}
          />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A99A8", fontSize: 11 }}
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E3E9EF",
              fontSize: 12,
              color: "#253746",
            }}
          />
          <Area
            type="monotone"
            dataKey="spentCents"
            name="Gasto"
            stroke="#64CBB1"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
