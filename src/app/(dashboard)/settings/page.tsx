import type { Metadata } from "next";

import { SettingsView } from "@/components/settings/settings-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/settings");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function SettingsPage() {
  return <SettingsView />;
}
