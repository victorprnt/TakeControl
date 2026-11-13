import type { Metadata } from "next";

import { RecurringView } from "@/components/recurring/recurring-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/recurring");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function RecurringPage() {
  return <RecurringView />;
}
