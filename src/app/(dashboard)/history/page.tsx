import type { Metadata } from "next";

import { HistoryView } from "@/components/history/history-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/history");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function HistoryPage() {
  return <HistoryView />;
}
