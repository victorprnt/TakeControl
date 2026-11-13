import type { Cents } from "@/types/money";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  /** Integer cents. */
  defaultBudget: Cents;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
