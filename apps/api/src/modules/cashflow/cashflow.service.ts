import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSalaryDto } from "./dto/create-salary.dto";
import { GetProjectionsQueryDto } from "./dto/get-projections.dto";
import { Prisma } from "@mymoney/db";
import { CashflowEventDto } from "./dto/cashflow-event.dto";
import { CashflowMonthProjectionDto, GroupedCashflowMonth } from "./dto/cashflow-month-projection.dto";
import { Money, Currency, BalanceDelta, DomainEvent, UNIT_OF_WORK, IUnitOfWork } from "@mymoney/shared";
import { IAccountRepository, ACCOUNT_REPOSITORY } from "../accounts/domain/interfaces/account.repository.interface";
import { ITransactionRepository, TRANSACTION_REPOSITORY } from "../transactions/domain/transaction.repository.interface";
import { Transaction } from "../transactions/domain/transaction.entity";
import { TransactionType } from "../transactions/domain/transaction-type.enum";

@Injectable()
export class CashflowService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  async updateEventStatus(
    userId: string,
    id: string,
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED',
  ): Promise<CashflowEventDto> {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId },
    });
    if (!event) throw new NotFoundException('Cashflow event not found');

    const updated = await this.prisma.cashflowEvent.update({
      where: { id },
      data: { status },
    });

    return CashflowEventDto.fromPrisma(updated);
  }

  async payEvent(
    userId: string,
    id: string,
    dto: { accountId: string; date?: string },
  ): Promise<CashflowEventDto> {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId },
    });
    if (!event) throw new NotFoundException('Cashflow event not found');

    const account = await this.accountRepository.findById(dto.accountId, userId);
    if (!account) throw new NotFoundException('Cuenta de origen no encontrada');

    const amountMoney = Money.of(event.amount.toNumber(), account.currency as Currency);

    if (event.type === 'EXPENSE' && account.currentBalance.value.lt(amountMoney.value)) {
      throw new BadRequestException(
        `Saldo insuficiente en ${account.name}. Saldo disponible: ${account.currentBalance.value.toFixed(2)} ${account.currency}`
      );
    }

    // Determine category, subscription, card
    let categoryId: string | null = null;
    let subscriptionId: string | null = null;
    let cardId: string | null = null;

    if (event.source_type === 'SUBSCRIPTION' && event.reference_id) {
      const sub = await this.prisma.subscription.findUnique({
        where: { id: event.reference_id },
      });
      if (sub) {
        categoryId = sub.category_id;
        subscriptionId = sub.id;
        cardId = sub.card_id;
      }
    } else if (event.source_type === 'INSTALLMENT' && event.reference_id) {
      const parentTx = await this.prisma.transaction.findUnique({
        where: { id: event.reference_id },
      });
      if (parentTx) {
        categoryId = parentTx.category_id;
        cardId = parentTx.card_id;
      }
    }

    const txDate = dto.date ? new Date(dto.date) : new Date(event.date);

    // Create domain transaction
    const transaction = Transaction.create({
      userId,
      accountId: account.id,
      categoryId,
      type: event.type as TransactionType,
      amount: amountMoney,
      description: event.description || (event.type === 'EXPENSE' ? 'Gasto diferido/suscripción' : 'Sueldo'),
      date: txDate,
      transferPairId: null,
      isRecurring: event.source_type === 'SUBSCRIPTION' || event.source_type === 'SALARY',
      isThirdParty: false,
      thirdPartyOwner: null,
      thirdPartyNote: null,
      paymentMethod: cardId ? 'CARD' : 'TRANSFER',
      cardId,
      subscriptionId,
      productId: null,
      installment: null,
    });

    const delta = event.type === 'INCOME'
      ? BalanceDelta.increase(amountMoney)
      : BalanceDelta.decrease(amountMoney);

    const balanceChangeEvent = account.applyBalanceDelta(delta, 'TRANSACTION_CREATED');

    await this.unitOfWork.execute(async () => {
      await this.transactionRepository.save(transaction);
      await this.accountRepository.save(account);
      await this.prisma.cashflowEvent.update({
        where: { id },
        data: {
          status: 'PAID',
          account_id: account.id,
        },
      });
    });

    // Emit domain events
    transaction.getDomainEvents().forEach((e: DomainEvent) => this.eventEmitter.emit(e.constructor.name, e));
    this.eventEmitter.emit(balanceChangeEvent.constructor.name, balanceChangeEvent);
    transaction.clearDomainEvents();

    const updatedEvent = await this.prisma.cashflowEvent.findUnique({ where: { id } });
    return CashflowEventDto.fromPrisma(updatedEvent!);
  }

  async unpayEvent(userId: string, id: string): Promise<CashflowEventDto> {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId },
    });
    if (!event) throw new NotFoundException('Cashflow event not found');

    const updated = await this.prisma.cashflowEvent.update({
      where: { id },
      data: { status: 'PENDING' },
    });

    return CashflowEventDto.fromPrisma(updated);
  }

  async deleteSalaryEvent(userId: string, id: string) {
    const event = await this.prisma.cashflowEvent.findFirst({
      where: { id, user_id: userId, source_type: "SALARY" },
    });
    if (!event) throw new NotFoundException("Salary event not found");

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
