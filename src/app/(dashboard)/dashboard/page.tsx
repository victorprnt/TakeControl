import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/dashboard");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function DashboardPage() {
  return <DashboardView />;
}
