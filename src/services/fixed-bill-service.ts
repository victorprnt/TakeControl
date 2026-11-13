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
   * The first month falls back to the household list.
   */
  async listForMonth(monthId: string): Promise<FixedBill[]> {
    if (!isMonthId(monthId)) {
      throw new DataAccessError("O mês precisa estar no formato AAAA-MM.", "invalid");
    }

    const all = await this.bills.list();
    const current = all.filter((bill) => bill.month === monthId).sort(byOrder);

    if (current.length > 0) {
      return current;
    }

    const sourceMonth = all
      .map((bill) => bill.month)
      .filter((month) => month < monthId)
      .sort()
      .at(-1);
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
