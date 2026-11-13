import type { Metadata } from "next";

import { TransactionsView } from "@/components/transactions/transactions-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/transactions");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function TransactionsPage() {
  return <TransactionsView />;
}
