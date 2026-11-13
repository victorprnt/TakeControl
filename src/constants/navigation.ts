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
    description: "Resumo, contas fixas e envelopes do mês.",
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
    href: "/categories",
    label: "Categorias",
    shortLabel: "Categorias",
    description: "Organize os envelopes do orçamento.",
    icon: Shapes,
  },
  {
    href: "/settings",
    label: "Configurações",
    shortLabel: "Ajustes",
    description: "Preferências da conta e do aplicativo.",
    icon: Settings,
  },
];

const mobileHrefs = ["/dashboard", "/budgets", "/categories", "/settings"];

/** Kept so existing routes still resolve a title. They stay out of the menu. */
const retiredNavigation: NavItem[] = [
  {
    href: "/transactions",
    label: "Transações",
    shortLabel: "Transações",
    description: "Registre entradas e saídas.",
    icon: ArrowLeftRight,
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
];

const pages = [...mainNavigation, ...retiredNavigation];

export const mobileNavigation = mobileHrefs.map((href) => getNavItem(href));

export function getNavItem(href: string): NavItem {
  const item = pages.find((entry) => entry.href === href);

  if (!item) {
    throw new Error(`Unknown navigation href: ${href}`);
  }

  return item;
}

export function getNavItemByPath(pathname: string): NavItem {
  return (
    pages.find((entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`)) ??
    mainNavigation[0]
  );
}
