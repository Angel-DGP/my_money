import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from './prisma.service';
import { IUnitOfWork } from '@mymoney/shared';
import { Prisma } from '@mymoney/db';

export const prismaTransactionStorage = new AsyncLocalStorage<Prisma.TransactionClient>();

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return prismaTransactionStorage.run(tx, () => {
        return work();
      });
    });
  }
}
