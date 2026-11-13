import type { Cents } from "@/types/money";
import type { MonthId } from "@/types/month";

/** Presentation fixtures. These numbers are not produced by budget rules. */
export const demoMonths = ["2026-09", "2026-10", "2026-11"] as const satisfies readonly MonthId[];

export const defaultDemoMonth: MonthId = "2026-11";

export type ProgressTone = "safe" | "warning" | "danger";

export type DemoIcon =
  | "basket"
  | "pharmacy"
  | "spark"
  | "user"
  | "home"
  | "bus"
  | "piggy";

export type DemoCategory = {
  id: string;
  name: string;
  shortName: string;
  icon: DemoIcon;
  allocatedCents: Cents;
  spentCents: Cents;
  availableCents: Cents;
  consumedPercent: number;
  tone: ProgressTone;
};

export type DemoTransaction = {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  amountCents: Cents;
  direction: "in" | "out";
};

export type DemoSummary = {
  availableCents: Cents;
  allocatedCents: Cents;
  spentCents: Cents;
  reservedCents: Cents;
};

export type DemoMonthSnapshot = {
  monthId: MonthId;
  summary: DemoSummary;
  categories: DemoCategory[];
  transactions: DemoTransaction[];
  recurring: DemoTransaction[];
};

export type DemoHistoryPoint = {
  monthId: MonthId;
  label: string;
  spentCents: Cents;
};

const allocations = [
  { id: "groceries", name: "Supermercado", shortName: "Mercado", icon: "basket" as const, allocatedCents: 120000 },
  { id: "pharmacy", name: "Farmácia", shortName: "Farmácia", icon: "pharmacy" as const, allocatedCents: 30000 },
  { id: "leisure", name: "Lazer", shortName: "Lazer", icon: "spark" as const, allocatedCents: 40000 },
  { id: "personal", name: "Gastos pessoais", shortName: "Pessoal", icon: "user" as const, allocatedCents: 35000 },
  { id: "bills", name: "Contas fixas", shortName: "Contas", icon: "home" as const, allocatedCents: 180000 },
  { id: "transport", name: "Transporte", shortName: "Transp.", icon: "bus" as const, allocatedCents: 45000 },
  { id: "reserve", name: "Reserva", shortName: "Reserva", icon: "piggy" as const, allocatedCents: 80000 },
];

function toneFor(percent: number): ProgressTone {
  if (percent >= 100) {
    return "danger";
  }
  if (percent >= 85) {
    return "warning";
  }
  return "safe";
}

function buildCategories(spentById: Record<string, Cents>): DemoCategory[] {
  return allocations.map((item) => {
    const spentCents = spentById[item.id] ?? 0;
    const consumedPercent = Math.round((spentCents / item.allocatedCents) * 100);
    return {
      ...item,
      spentCents,
      availableCents: item.allocatedCents - spentCents,
      consumedPercent,
      tone: toneFor(consumedPercent),
    };
  });
}

function summarize(categories: DemoCategory[]): DemoSummary {
  const allocatedCents = categories.reduce((total, item) => total + item.allocatedCents, 0);
  const spentCents = categories.reduce((total, item) => total + item.spentCents, 0);
  const reserve = categories.find((item) => item.id === "reserve");

  return {
    allocatedCents,
    spentCents,
    availableCents: allocatedCents - spentCents,
    reservedCents: reserve?.availableCents ?? 0,
  };
}

function snapshot(
  monthId: MonthId,
  spentById: Record<string, Cents>,
  transactions: DemoTransaction[],
  recurring: DemoTransaction[],
): DemoMonthSnapshot {
  const categories = buildCategories(spentById);
  return {
    monthId,
    categories,
    transactions,
    recurring,
    summary: summarize(categories),
  };
}

const recurring: DemoTransaction[] = [
  {
    id: "rent",
    title: "Aluguel",
    category: "Contas fixas",
    dateLabel: "Todo dia 5",
    amountCents: 145000,
    direction: "out",
  },
  {
    id: "internet",
    title: "Internet",
    category: "Contas fixas",
    dateLabel: "Todo dia 8",
    amountCents: 12990,
    direction: "out",
  },
  {
    id: "energy",
    title: "Energia",
    category: "Contas fixas",
    dateLabel: "Todo dia 12",
    amountCents: 18900,
    direction: "out",
  },
  {
    id: "gym",
    title: "Academia",
    category: "Gastos pessoais",
    dateLabel: "Todo dia 3",
    amountCents: 9900,
    direction: "out",
  },
];

const snapshots: Record<MonthId, DemoMonthSnapshot> = {
  "2026-09": snapshot(
    "2026-09",
    {
      groceries: 74000,
      pharmacy: 12000,
      leisure: 18000,
      personal: 21000,
      bills: 160000,
      transport: 19000,
      reserve: 10000,
    },
    [
      { id: "s1", title: "Salário", category: "Entrada", dateLabel: "05 set 2026", amountCents: 545500, direction: "in" },
      { id: "s2", title: "Feira de sábado", category: "Supermercado", dateLabel: "06 set 2026", amountCents: 18640, direction: "out" },
      { id: "s3", title: "Ônibus", category: "Transporte", dateLabel: "09 set 2026", amountCents: 19000, direction: "out" },
      { id: "s4", title: "Cinema", category: "Lazer", dateLabel: "14 set 2026", amountCents: 5400, direction: "out" },
    ],
    recurring,
  ),
  "2026-10": snapshot(
    "2026-10",
    {
      groceries: 98000,
      pharmacy: 16000,
      leisure: 36000,
      personal: 24000,
      bills: 175000,
      transport: 41000,
      reserve: 15000,
    },
    [
      { id: "o1", title: "Salário", category: "Entrada", dateLabel: "05 out 2026", amountCents: 545500, direction: "in" },
      { id: "o2", title: "Mercado Central", category: "Supermercado", dateLabel: "07 out 2026", amountCents: 24320, direction: "out" },
      { id: "o3", title: "Aplicativo de viagem", category: "Transporte", dateLabel: "18 out 2026", amountCents: 3280, direction: "out" },
      { id: "o4", title: "Jantar", category: "Lazer", dateLabel: "21 out 2026", amountCents: 8900, direction: "out" },
      { id: "o5", title: "Farmácia da esquina", category: "Farmácia", dateLabel: "25 out 2026", amountCents: 4590, direction: "out" },
    ],
    recurring,
  ),
  "2026-11": snapshot(
    "2026-11",
    {
      groceries: 86000,
      pharmacy: 28000,
      leisure: 15000,
      personal: 36000,
      bills: 180000,
      transport: 22000,
      reserve: 20000,
    },
    [
      { id: "n1", title: "Salário", category: "Entrada", dateLabel: "05 nov 2026", amountCents: 545500, direction: "in" },
      { id: "n2", title: "Supermercado Extra", category: "Supermercado", dateLabel: "06 nov 2026", amountCents: 18600, direction: "out" },
      { id: "n3", title: "Farmácia Droga Mais", category: "Farmácia", dateLabel: "08 nov 2026", amountCents: 4200, direction: "out" },
      { id: "n4", title: "Bilhete mensal", category: "Transporte", dateLabel: "09 nov 2026", amountCents: 22000, direction: "out" },
      { id: "n5", title: "Energia", category: "Contas fixas", dateLabel: "12 nov 2026", amountCents: 18900, direction: "out" },
      { id: "n6", title: "Cinema", category: "Lazer", dateLabel: "13 nov 2026", amountCents: 6400, direction: "out" },
    ],
    recurring,
  ),
};

export const demoHistory: DemoHistoryPoint[] = [
  { monthId: "2026-06", label: "Jun", spentCents: 298000 },
  { monthId: "2026-07", label: "Jul", spentCents: 341000 },
  { monthId: "2026-08", label: "Ago", spentCents: 312500 },
  { monthId: "2026-09", label: "Set", spentCents: 314000 },
  { monthId: "2026-10", label: "Out", spentCents: 405000 },
  { monthId: "2026-11", label: "Nov", spentCents: 387000 },
];

export function getDemoSnapshot(monthId: MonthId): DemoMonthSnapshot {
  return snapshots[monthId] ?? snapshots[defaultDemoMonth];
}
