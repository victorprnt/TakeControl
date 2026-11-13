import type { Metadata } from "next";

import { CategoriesView } from "@/components/categories/categories-view";
import { getNavItem } from "@/constants/navigation";

const navItem = getNavItem("/categories");

export const metadata: Metadata = {
  title: navItem.label,
};

export default function CategoriesPage() {
  return <CategoriesView />;
}
