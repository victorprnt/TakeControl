import {
  ArrowLeftRight,
  LayoutDashboard,
  LineChart,
  Repeat,
  Settings,
  Shapes,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export const mainNavigation: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Início",
    description: "Acompanhe o mês em um só lugar.",
    icon: LayoutDashboard,
  },
  {
    href: "/budgets",
    label: "Orçamentos",
    shortLabel: "Orçamentos",
    description: "Distribua a renda do mês entre os envelopes.",
    icon: Wallet,
  },
  {
    href: "/transactions",
    label: "Transações",
    shortLabel: "Transações",
    description: "Registre entradas e saídas.",
    icon: ArrowLeftRight,
  },
  {
    href: "/categories",
    label: "Categorias",
    shortLabel: "Categorias",
    description: "Organize os envelopes do orçamento.",
    icon: Shapes,
  },
  {
    href: "/recurring",
    label: "Recorrências",
    shortLabel: "Recorrências",
    description: "Regras que geram os lançamentos de cada período.",
    icon: Repeat,
  },
  {
    href: "/history",
    label: "Histórico",
    shortLabel: "Histórico",
    description: "Veja como os gastos evoluem ao longo dos meses.",
    icon: LineChart,
  },
  {
    href: "/settings",
    label: "Configurações",
    shortLabel: "Configurações",
    description: "Preferências da conta e do aplicativo.",
    icon: Settings,
  },
];

const mobileHrefs = ["/dashboard", "/budgets", "/transactions", "/history"];

export const mobileNavigation = mobileHrefs.map((href) => getNavItem(href));

export function getNavItem(href: string): NavItem {
  const item = mainNavigation.find((entry) => entry.href === href);

  if (!item) {
    throw new Error(`Unknown navigation href: ${href}`);
  }

  return item;
}

export function getNavItemByPath(pathname: string): NavItem {
  return (
    mainNavigation.find(
      (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
    ) ?? mainNavigation[0]
  );
}
