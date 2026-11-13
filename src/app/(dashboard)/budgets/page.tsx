import type { Metadata } from "next";

import { BudgetsView } from "@/components/budgets/budgets-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/budgets");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function BudgetsPage() {
  return <BudgetsView />;
}
