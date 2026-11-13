import "server-only";

import { categoryIconNames, type CategoryIconName } from "@/constants/category-icons";
import { isHexColor } from "@/lib/validations/records";
import { DataAccessError } from "@/services/errors";
import type { CategoryRepository, NewCategory } from "@/services/repositories/category-repository";
import type { Category } from "@/types/category";
import type { Cents } from "@/types/money";

export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  list(): Promise<Category[]> {
    return this.categories.list();
  }

  async listActive(): Promise<Category[]> {
    const categories = await this.categories.list();
    return categories.filter((category) => category.isActive);
  }

  async get(id: string): Promise<Category> {
    const category = await this.categories.findById(id);

    if (!category) {
      throw new DataAccessError("Categoria não encontrada.", "not_found", 404);
    }

    return category;
  }

  create(input: NewCategory): Promise<Category> {
    return this.categories.create(this.parse(input));
  }

  async update(id: string, input: Partial<NewCategory>): Promise<Category> {
    if (Object.keys(input).length === 0) {
      throw new DataAccessError("Nenhuma alteração foi informada.", "invalid");
    }

    return this.categories.update(id, this.parsePartial(input));
  }

  private parse(input: NewCategory): NewCategory {
    const description = this.optionalText(input.description);

    return {
      name: this.requiredText(input.name, "O nome da categoria"),
      icon: this.icon(input.icon),
      color: this.color(input.color),
      ...(description ? { description } : {}),
      defaultBudget: this.budget(input.defaultBudget),
      isActive: this.flag(input.isActive),
    };
  }

  private parsePartial(input: Partial<NewCategory>): Partial<NewCategory> {
    const next: Partial<NewCategory> = {};

    if (input.name !== undefined) {
      next.name = this.requiredText(input.name, "O nome da categoria");
    }

    if (input.icon !== undefined) {
      next.icon = this.icon(input.icon);
    }

    if (input.color !== undefined) {
      next.color = this.color(input.color);
    }

    if (input.description !== undefined) {
      next.description = input.description.trim();
    }

    if (input.defaultBudget !== undefined) {
      next.defaultBudget = this.budget(input.defaultBudget);
    }

    if (input.isActive !== undefined) {
      next.isActive = this.flag(input.isActive);
    }

    return next;
  }

  private requiredText(value: string, label: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new DataAccessError(`${label} é obrigatório.`, "invalid");
    }

    return trimmed;
  }

  private optionalText(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private icon(value: string): CategoryIconName {
    const trimmed = value.trim();

    if (!categoryIconNames.includes(trimmed as CategoryIconName)) {
      throw new DataAccessError("Escolha um ícone da lista.", "invalid");
    }

    return trimmed as CategoryIconName;
  }

  private color(value: string): string {
    if (!isHexColor(value)) {
      throw new DataAccessError("A cor da categoria precisa ser um hexadecimal de seis dígitos.", "invalid");
    }

    return value;
  }

  private budget(value: Cents): Cents {
    if (!Number.isInteger(value) || value < 0) {
      throw new DataAccessError("O orçamento padrão precisa ser um valor inteiro em centavos.", "invalid");
    }

    return value;
  }

  private flag(value: boolean): boolean {
    if (typeof value !== "boolean") {
      throw new DataAccessError("Informe se a categoria está ativa.", "invalid");
    }

    return value;
  }
}
