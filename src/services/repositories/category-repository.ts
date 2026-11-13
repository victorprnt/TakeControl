import type { Category } from "@/types/category";

export type NewCategory = {
  name: string;
  icon: string;
  color: string;
  description?: string;
  defaultBudget: Category["defaultBudget"];
  isActive: boolean;
};

export interface CategoryRepository {
  list(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(input: NewCategory): Promise<Category>;
  update(id: string, input: Partial<NewCategory>): Promise<Category>;
}
