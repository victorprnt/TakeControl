"use client";

import { useId } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DemoCategory } from "@/constants/demo";
import { formatCurrency, formatCurrencyCompact } from "@/lib/formatters";

const fills = ["#64CBB1", "#65B8E8", "#EBD58A", "#E78A91", "#9BB8C9", "#7DCFC0", "#8EC9EF"];

type ExpenseChartProps = {
  categories: DemoCategory[];
};

export function ExpenseChart({ categories }: ExpenseChartProps) {
  const labelId = useId().replace(/:/g, "");
  const data = categories.map((category, index) => ({
    name: category.shortName,
    spentCents: category.spentCents,
    fill: fills[index % fills.length],
  }));

  return (
    <div className="h-72 w-full min-w-0" aria-labelledby={labelId}>
      <p id={labelId} className="sr-only">
        Gastos ilustrativos por categoria
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            type="number"
            hide
            tickFormatter={(value: number) => formatCurrencyCompact(value)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={68}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#8A99A8", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #E3E9EF",
              fontSize: 12,
              color: "#253746",
            }}
          />
          <Bar dataKey="spentCents" radius={8} barSize={12} name="Gasto">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
