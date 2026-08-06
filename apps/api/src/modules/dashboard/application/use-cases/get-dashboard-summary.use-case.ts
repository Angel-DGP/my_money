import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DashboardSummaryDto } from '../dtos/dashboard-summary.dto';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<DashboardSummaryDto> {
    const accounts = await this.prisma.account.findMany({
      where: { user_id: userId, is_active: true }
    });

    const balancesByCurrency: Record<string, number> = {};

    for (const account of accounts) {
      if (!balancesByCurrency[account.currency]) {
        balancesByCurrency[account.currency] = 0;
      }
      balancesByCurrency[account.currency] += Number(account.current_balance);
    }

    const total_balance = Object.entries(balancesByCurrency).map(([currency, amount]) => ({
      currency,
      amount
    }));

    // For Phase C.1, we assume reserved, blocked and third_party are 0.
    // The available balance is the same as total for now.
    const empty_balances = Object.keys(balancesByCurrency).map((currency) => ({
      currency,
      amount: 0
    }));

    return {
      total_balance,
      reserved_funds: empty_balances,
      blocked_funds: empty_balances,
      third_party_funds: empty_balances,
      available_balance: total_balance,
    };
  }
}
