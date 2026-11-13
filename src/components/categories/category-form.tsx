"use client";

import { useState, type FormEvent } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categoryColors } from "@/constants/category-colors";
import { categoryIcons } from "@/constants/category-icons";
import { formatCurrencyInput, parseCurrencyToCents } from "@/lib/formatters/currency-input";
import { saveCategory, updateCategory } from "@/services/finance-actions";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 w-full rounded-2xl border border-input bg-card px-3 text-base font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

type CategoryFormProps = {
  category?: Category;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function CategoryForm({ category, onOpenChange, onSaved }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? categoryIcons[0].id);
  const [color, setColor] = useState(category?.color ?? categoryColors[0]);
  const [budget, setBudget] = useState(formatCurrencyInput(category?.defaultBudget ?? 0));
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const defaultBudget = parseCurrencyToCents(budget);

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    if (defaultBudget === null) {
      setError("O orçamento padrão precisa ser um valor como 800,00.");
      return;
    }

    setPending(true);
    const input = {
      name,
      description,
      icon,
      color,
      defaultBudget,
      isActive,
    };
    const result = category
      ? await updateCategory(category.id, input)
      : await saveCategory(input);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    onSaved();
    onOpenChange(false);
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-3xl px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="px-0">
          <SheetTitle>{category ? "Editar categoria" : "Nova categoria"}</SheetTitle>
          <SheetDescription>
            O orçamento padrão entra na sugestão de um mês novo quando a categoria ainda não tem valor anterior.
          </SheetDescription>
        </SheetHeader>
        <form className="grid gap-4 pb-2" onSubmit={(event) => void submit(event)}>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Nome
            <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClassName} autoComplete="off" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Descrição
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldClassName}
              autoComplete="off"
            />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">Ícone</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {categoryIcons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={icon === item.id}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-2xl border border-transparent bg-muted text-foreground",
                    icon === item.id && "border-primary bg-accent text-accent-foreground",
                  )}
                  onClick={() => setIcon(item.id)}
                >
                  <CategoryIcon name={item.id} className="size-4" />
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">Cor</legend>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Cor ${swatch}`}
                  aria-pressed={color.toLowerCase() === swatch.toLowerCase()}
                  className={cn(
                    "size-11 rounded-full border-2 border-transparent",
                    color.toLowerCase() === swatch.toLowerCase() && "border-foreground",
                  )}
                  style={{ backgroundColor: swatch }}
                  onClick={() => setColor(swatch)}
                />
              ))}
              <label className="flex h-11 items-center gap-2 rounded-full bg-muted px-3 text-sm text-foreground">
                Outra
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#64CBB1"}
                  aria-label="Escolher outra cor"
                  className="size-8 border-0 bg-transparent"
                  onChange={(event) => setColor(event.target.value.toUpperCase())}
                />
              </label>
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-sm font-medium text-foreground">
            Orçamento padrão
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              className={fieldClassName}
            />
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            className="flex h-12 items-center justify-between rounded-2xl bg-muted px-4 text-sm font-medium text-foreground"
            onClick={() => setIsActive((current) => !current)}
          >
            Categoria ativa
            <span className={cn("text-xs", isActive ? "text-accent-foreground" : "text-muted-foreground")}>
              {isActive ? "Sim" : "Não"}
            </span>
          </button>
          {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
          <Button type="submit" className="h-11 rounded-full" disabled={pending}>
            {pending ? "Salvando" : "Salvar categoria"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
