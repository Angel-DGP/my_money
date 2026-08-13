import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSalaryDto } from "./dto/create-salary.dto";
import { GetProjectionsQueryDto } from "./dto/get-projections.dto";
import { Prisma } from "@mymoney/db";
import { CashflowEventDto } from "./dto/cashflow-event.dto";
import { CashflowMonthProjectionDto, GroupedCashflowMonth } from "./dto/cashflow-month-projection.dto";

@Injectable()
export class CashflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjections(userId: string, query: GetProjectionsQueryDto): Promise<CashflowMonthProjectionDto[]> {
    const { startDate, endDate, accountId } = query;

    const events = await this.prisma.cashflowEvent.findMany({
      where: {
        user_id: userId,
        ...(accountId ? { account_id: accountId } : {}),
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: "asc" },
    });

    // Fetch transaction info for INSTALLMENT events to ensure human-readable descriptions
    const installmentReferenceIds = events
      .filter((e) => e.source_type === "INSTALLMENT" && e.reference_id)
      .map((e) => e.reference_id as string);

    const txMap = new Map<string, string>();
    if (installmentReferenceIds.length > 0) {
      const transactions = await this.prisma.transaction.findMany({
        where: { id: { in: installmentReferenceIds } },
        select: {
          id: true,
          description: true,
          category: { select: { name: true } },
        },
      });
      for (const tx of transactions) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.description || "");
        const desc = (!isUUID && tx.description) ? tx.description : (tx.category?.name || "Gasto diferido");
        txMap.set(tx.id, desc);
      }
    }

    // Group by month
    const grouped = events.reduce(
      (acc, event) => {
        const monthKey = event.date.toISOString().slice(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            total_income: new Prisma.Decimal(0),
            total_expense: new Prisma.Decimal(0),
            events: [],
          };
        }

        if (event.type === "INCOME") {
          acc[monthKey].total_income = acc[monthKey].total_income.add(event.amount);
        } else {
          acc[monthKey].total_expense = acc[monthKey].total_expense.add(event.amount);
        }

        // Clean up description if it contains a raw UUID
        let finalDescription = event.description || "";
        if (event.source_type === "INSTALLMENT" && event.reference_id) {
          const txDesc = txMap.get(event.reference_id);
          if (txDesc) {
            finalDescription = finalDescription.replace(
              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
              txDesc
            );
          }
        }

        acc[monthKey].events.push({
          ...event,
          description: finalDescription,
        });
        return acc;
      },
      {} as Record<string, GroupedCashflowMonth>,
    );

    const sorted = Object.values(grouped).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    return sorted.map((g) => CashflowMonthProjectionDto.fromGrouped(g));
  }

  async registerSalary(userId: string, dto: CreateSalaryDto) {
    const eventsToCreate = [];
    const currentDate = new Date(dto.startDate);

    for (let i = 0; i < dto.months; i++) {
      eventsToCreate.push({
        user_id: userId,
        amount: dto.amount,
        type: "INCOME",
        date: new Date(currentDate),
        source_type: "SALARY",
        account_id: dto.accountId,
        description: dto.description || "Sueldo",
        status: "PENDING",
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await this.prisma.cashflowEvent.createMany({ data: eventsToCreate });
    return { message: `${dto.months} salary events created successfully` };
  }

  async listSalaries(userId: string): Promise<CashflowEventDto[]> {
    const records = await this.prisma.cashflowEvent.findMany({
      where: {
        user_id: userId,
        source_type: "SALARY",
        status: { not: "CANCELLED" },
      },
      orderBy: { date: "asc" },
    });
    return records.map(r => CashflowEventDto.fromPrisma(r));
  }

  async updateSalaryEvent(
    userId: string,
    id: string,
    data: { amount?: number; description?: string },
  ): Promise<CashflowEventDto> {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId, source_type: "SALARY" },
    });
    if (!event) throw new Error("Salary event not found");

    const updated = await this.prisma.cashflowEvent.update({
      where: { id },
      data: {
        ...(data.amount !== undefined
          ? { amount: new Prisma.Decimal(data.amount) }
          : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
      },
    });

    return CashflowEventDto.fromPrisma(updated);
  }

  async deleteSalaryEvent(userId: string, id: string) {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId, source_type: "SALARY" },
    });
    if (!event) throw new Error("Salary event not found");

    await this.prisma.cashflowEvent.delete({ where: { id } });
    return { message: "Salary event deleted" };
  }

  async generateDeferredEvents(
    userId: string,
    transactionId: string,
    amount: Prisma.Decimal,
    installments: number,
    date: Date,
    description: string,
    accountId: string,
  ) {
    const eventsToCreate = [];
    const installmentAmount = amount.dividedBy(installments);
    const currentDate = new Date(date);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(description || "");
    const cleanDescription = (isUUID || !description) ? "Gasto diferido" : description;

    for (let i = 0; i < installments; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);

      eventsToCreate.push({
        user_id: userId,
        amount: installmentAmount,
        type: "EXPENSE",
        date: new Date(currentDate),
        source_type: "INSTALLMENT",
        reference_id: transactionId,
        account_id: accountId,
        description: `Cuota ${i + 1}/${installments} - ${cleanDescription}`,
        status: "PENDING",
      });
    }

    await this.prisma.cashflowEvent.createMany({ data: eventsToCreate });
  }
}
