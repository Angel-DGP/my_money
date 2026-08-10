import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSalaryDto } from "./dto/create-salary.dto";
import { GetProjectionsQueryDto } from "./dto/get-projections.dto";
import { Prisma } from "@mymoney/db";

@Injectable()
export class CashflowService {
  constructor(private readonly prisma: PrismaService) {}

  async getProjections(userId: string, query: GetProjectionsQueryDto) {
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
      orderBy: {
        date: "asc",
      },
    });

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
          acc[monthKey].total_income = acc[monthKey].total_income.add(
            event.amount,
          );
        } else {
          acc[monthKey].total_expense = acc[monthKey].total_expense.add(
            event.amount,
          );
        }

        acc[monthKey].events.push(event);
        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(grouped).sort((a: any, b: any) =>
      a.month.localeCompare(b.month),
    );
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
        description: dto.description || `Sueldo`,
        status: "PENDING",
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    await this.prisma.cashflowEvent.createMany({
      data: eventsToCreate,
    });

    return { message: `${dto.months} salary events created successfully` };
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
        description: `Cuota ${i + 1}/${installments} - ${description}`,
        status: "PENDING",
      });
    }

    await this.prisma.cashflowEvent.createMany({
      data: eventsToCreate,
    });
  }
}
