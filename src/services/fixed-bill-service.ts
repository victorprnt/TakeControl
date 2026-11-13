import "server-only";

import { isMonthId } from "@/lib/validations/month-id";
import { DataAccessError } from "@/services/errors";
import type { FixedBillPatch, FixedBillRepository, NewFixedBill } from "@/services/repositories/fixed-bill-repository";
import type { FixedBill } from "@/types/fixed-bill";

const householdBills: readonly NewFixedBill[] = [
  { name: "Aluguel", icon: "home", amount: 145000, paid: false, month: "2026-01", sortOrder: 0 },
  { name: "Luz", icon: "zap", amount: 17010, paid: false, month: "2026-01", sortOrder: 1 },
  { name: "Água", icon: "droplet", amount: 8200, paid: false, month: "2026-01", sortOrder: 2 },
  { name: "Gás", icon: "flame", amount: 5400, paid: false, month: "2026-01", sortOrder: 3 },
  { name: "Internet", icon: "wifi", amount: 12990, paid: false, month: "2026-01", sortOrder: 4 },
];

function byOrder(left: FixedBill, right: FixedBill): number {
  return left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "pt-BR");
}

export class FixedBillService {
  constructor(private readonly bills: FixedBillRepository) {}

  /**
   * Bills for the month. A month without rows copies the previous amounts, unpaid.
   * A month the user emptied stays empty, including the following month.
   * The first month falls back to the household list.
   */
  async listForMonth(monthId: string): Promise<FixedBill[]> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const all = await this.bills.list();
    const cleared = new Set(await this.bills.listClearedMonths());
    const current = all.filter((bill) => bill.month === monthId).sort(byOrder);

    if (current.length > 0) {
      return current;
    }

    if (cleared.has(monthId)) {
      return [];
    }

    const sourceMonth = [...new Set([...all.map((bill) => bill.month), ...cleared])]
      .filter((month) => month < monthId)
      .sort()
      .at(-1);

    if (sourceMonth && cleared.has(sourceMonth) && !all.some((bill) => bill.month === sourceMonth)) {
      await this.bills.markMonthCleared(monthId);
      return [];
    }

    const templates = sourceMonth ? all.filter((bill) => bill.month === sourceMonth) : householdBills;

    const created = await Promise.all(
      templates.map((bill) =>
        this.bills.create({
          name: bill.name,
          icon: bill.icon,
          amount: bill.amount,
          paid: false,
          month: monthId,
          sortOrder: bill.sortOrder,
        }),
      ),
    );

    return created.sort(byOrder);
  }

  async add(monthId: string, input: { name: string; amount: number }): Promise<FixedBill> {
    const name = input.name.trim().replace(/\s+/g, " ");

    if (!name) {
      throw new DataAccessError("Informe o nome da conta.", "invalid");
    }

    if (name.length > 40) {
      throw new DataAccessError("O nome da conta precisa ter até 40 caracteres.", "invalid");
    }

    if (!Number.isInteger(input.amount) || input.amount < 0) {
      throw new DataAccessError("O valor da conta não pode ser negativo.", "invalid");
    }

    const current = await this.listForMonth(monthId);
    const duplicate = current.some((bill) => bill.name.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0);

    if (duplicate) {
      throw new DataAccessError("Já existe uma conta com esse nome neste mês.", "conflict");
    }

    const sortOrder = current.reduce((highest, bill) => Math.max(highest, bill.sortOrder), -1) + 1;

    return this.bills.create({
      name,
      icon: "wallet",
      amount: input.amount,
      paid: false,
      month: monthId,
      sortOrder,
    });
  }

  async remove(id: string): Promise<void> {
    const all = await this.bills.list();
    const current = all.find((bill) => bill.id === id);

    if (!current) {
      throw new DataAccessError("Registro não encontrado.", "not_found", 404);
    }

    await this.bills.delete(id);

    const remaining = all.some((bill) => bill.month === current.month && bill.id !== id);

    if (!remaining) {
      await this.bills.markMonthCleared(current.month);
    }
  }

  async update(id: string, input: FixedBillPatch): Promise<FixedBill> {
    if (input.amount === undefined && input.paid === undefined) {
      throw new DataAccessError("Nenhuma alteração foi informada.", "invalid");
    }

    if (input.amount !== undefined && (!Number.isInteger(input.amount) || input.amount < 0)) {
      throw new DataAccessError("O valor da conta não pode ser negativo.", "invalid");
    }

    if (input.paid !== undefined && typeof input.paid !== "boolean") {
      throw new DataAccessError("O pagamento da conta é inválido.", "invalid");
    }

    return this.bills.update(id, input);
  }
}
