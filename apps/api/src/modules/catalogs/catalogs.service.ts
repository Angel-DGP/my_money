import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { CreateProductServiceDto, UpdateSubscriptionDto } from './dto/catalogs.dto';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Institutions ---
  async getInstitutions(userId: string) {
    let institutions = await this.prisma.institution.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });

    if (institutions.length === 0) {
      await this.prisma.institution.createMany({
        data: [
          { user_id: userId, name: 'Efectivo / Personal', type: 'OTHER' },
          { user_id: userId, name: 'Banco Principal', type: 'BANK' },
        ],
      });
      institutions = await this.prisma.institution.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' },
      });
    }

    return institutions;
  }

  async createInstitution(userId: string, data: { name: string; type: string }) {
    return this.prisma.institution.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async updateInstitution(userId: string, id: string, data: { name?: string; type?: string }) {
    return this.prisma.institution.update({
      where: { id, user_id: userId },
      data,
    });
  }

  async deleteInstitution(userId: string, id: string) {
    return this.prisma.institution.delete({
      where: { id, user_id: userId },
    });
  }

  // --- Card Brands ---
  async getCardBrands(userId: string) {
    let brands = await this.prisma.cardBrand.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });

    if (brands.length === 0) {
      await this.prisma.cardBrand.createMany({
        data: [
          { user_id: userId, name: 'Visa' },
          { user_id: userId, name: 'Mastercard' },
          { user_id: userId, name: 'American Express' },
        ],
      });
      brands = await this.prisma.cardBrand.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' },
      });
    }

    return brands;
  }

  async createCardBrand(userId: string, data: { name: string }) {
    return this.prisma.cardBrand.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async updateCardBrand(userId: string, id: string, data: { name: string }) {
    return this.prisma.cardBrand.update({
      where: { id, user_id: userId },
      data,
    });
  }

  async deleteCardBrand(userId: string, id: string) {
    return this.prisma.cardBrand.delete({
      where: { id, user_id: userId },
    });
  }



  // --- Cards ---
  async getCards(userId: string) {
    return this.prisma.card.findMany({
      where: { user_id: userId },
      include: { institution: true, brand: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCard(userId: string, data: { institution_id: string; name: string; brand_id: string; type: string; last_four: string; base_interest_rate?: string | null; billing_day?: number | null; payment_day?: number | null }) {
    return this.prisma.card.create({
      data: {
        ...data,
        base_interest_rate: data.base_interest_rate ? Number(data.base_interest_rate) : null,
        user_id: userId,
      },
    });
  }

  async updateCard(userId: string, id: string, data: { institution_id?: string; name?: string; brand_id?: string; type?: string; last_four?: string; base_interest_rate?: string | null; billing_day?: number | null; payment_day?: number | null }) {
    return this.prisma.card.update({
      where: { id, user_id: userId },
      data: {
        ...data,
        base_interest_rate: data.base_interest_rate ? Number(data.base_interest_rate) : null,
      },
    });
  }

  async deleteCard(userId: string, id: string) {
    return this.prisma.card.delete({
      where: { id, user_id: userId },
    });
  }

  // --- Subscriptions ---
  async getSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { user_id: userId },
      include: { card: true, category: true },
      orderBy: { next_billing_date: 'asc' },
    });

    const subIds = subscriptions.map((s) => s.id);
    if (subIds.length === 0) return [];

    const eventCounts = await this.prisma.cashflowEvent.groupBy({
      by: ['reference_id'],
      where: {
        user_id: userId,
        source_type: 'SUBSCRIPTION',
        reference_id: { in: subIds },
      },
      _count: { id: true },
    });

    const countMap = new Map<string, number>();
    eventCounts.forEach((c) => {
      if (c.reference_id) countMap.set(c.reference_id, c._count.id);
    });

    const pendingEventCounts = await this.prisma.cashflowEvent.groupBy({
      by: ['reference_id'],
      where: {
        user_id: userId,
        source_type: 'SUBSCRIPTION',
        reference_id: { in: subIds },
        status: 'PENDING',
      },
      _count: { id: true },
    });

    const pendingMap = new Map<string, number>();
    pendingEventCounts.forEach((c) => {
      if (c.reference_id) pendingMap.set(c.reference_id, c._count.id);
    });

    return subscriptions.map((s) => {
      const totalMonths = countMap.get(s.id) ?? 12;
      const pendingMonths = pendingMap.get(s.id) ?? 0;
      const isCompleted = countMap.has(s.id) && pendingMonths === 0;

      return {
        ...s,
        duration_months: totalMonths,
        pending_months: pendingMonths,
        is_completed: isCompleted,
      };
    });
  }

  async createSubscription(userId: string, data: { category_id: string; card_id?: string; name: string; amount: number; currency?: string; billing_cycle: string; next_billing_date: string; url?: string; duration_months?: number }) {
    const subscription = await this.prisma.subscription.create({
      data: {
        category_id: data.category_id,
        card_id: data.card_id,
        name: data.name,
        amount: data.amount,
        currency: data.currency || 'USD',
        billing_cycle: data.billing_cycle,
        next_billing_date: new Date(data.next_billing_date),
        url: data.url,
        user_id: userId,
      },
    });

    const months = data.duration_months && data.duration_months > 0 ? data.duration_months : 12;
    const eventsToCreate = [];
    const dateParts = data.next_billing_date.split('-').map(Number);
    const yearStr = dateParts[0] || new Date().getFullYear();
    const monthStr = dateParts[1] || (new Date().getMonth() + 1);
    const dayStr = dateParts[2] || new Date().getDate();

    for (let i = 0; i < months; i++) {
      let y = yearStr;
      let m = (monthStr - 1) + i;
      if (data.billing_cycle === 'YEARLY') {
        y = yearStr + i;
        m = monthStr - 1;
      }
      const eventDate = new Date(Date.UTC(y, m, dayStr, 12, 0, 0));

      eventsToCreate.push({
        user_id: userId,
        amount: data.amount,
        type: 'EXPENSE',
        date: eventDate,
        source_type: 'SUBSCRIPTION',
        reference_id: subscription.id,
        description: `Suscripción: ${data.name}`,
        status: 'PENDING',
      });
    }

    if (eventsToCreate.length > 0) {
      await this.prisma.cashflowEvent.createMany({ data: eventsToCreate });
    }

    return {
      ...subscription,
      duration_months: months,
    };
  }

  async updateSubscription(userId: string, id: string, data: UpdateSubscriptionDto) {
    const updateData: {
      category_id?: string;
      card_id?: string | null;
      name?: string;
      amount?: number;
      currency?: string;
      billing_cycle?: string;
      next_billing_date?: Date;
      url?: string | null;
    } = {};

    if (data.category_id !== undefined) updateData.category_id = data.category_id;
    if (data.card_id !== undefined) updateData.card_id = data.card_id;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.billing_cycle !== undefined) updateData.billing_cycle = data.billing_cycle;
    if (data.next_billing_date !== undefined) updateData.next_billing_date = new Date(data.next_billing_date);
    if (data.url !== undefined) updateData.url = data.url;

    const subscription = await this.prisma.subscription.update({
      where: { id, user_id: userId },
      data: updateData,
    });

    if (data.name || data.amount !== undefined) {
      await this.prisma.cashflowEvent.updateMany({
        where: {
          user_id: userId,
          reference_id: id,
          source_type: 'SUBSCRIPTION',
          status: 'PENDING',
        },
        data: {
          ...(data.name ? { description: `Suscripción: ${data.name}` } : {}),
          ...(data.amount !== undefined ? { amount: data.amount } : {}),
        },
      });
    }

    if (data.duration_months && data.duration_months > 0) {
      await this.prisma.cashflowEvent.deleteMany({
        where: {
          user_id: userId,
          reference_id: id,
          source_type: 'SUBSCRIPTION',
          status: 'PENDING',
        },
      });

      const nextDate = new Date(subscription.next_billing_date);
      const eventsToCreate = [];
      const yearStr = nextDate.getUTCFullYear();
      const monthStr = nextDate.getUTCMonth();
      const dayStr = nextDate.getUTCDate();

      for (let i = 0; i < data.duration_months; i++) {
        let y = yearStr;
        let m = monthStr + i;
        if (subscription.billing_cycle === 'YEARLY') {
          y = yearStr + i;
          m = monthStr;
        }
        const eventDate = new Date(Date.UTC(y, m, dayStr, 12, 0, 0));

        eventsToCreate.push({
          user_id: userId,
          amount: subscription.amount,
          type: 'EXPENSE',
          date: eventDate,
          source_type: 'SUBSCRIPTION',
          reference_id: id,
          description: `Suscripción: ${subscription.name}`,
          status: 'PENDING',
        });
      }

      if (eventsToCreate.length > 0) {
        await this.prisma.cashflowEvent.createMany({ data: eventsToCreate });
      }
    }

    return subscription;
  }

  async deleteSubscription(userId: string, id: string) {
    await this.prisma.cashflowEvent.deleteMany({
      where: {
        user_id: userId,
        reference_id: id,
        source_type: 'SUBSCRIPTION',
      },
    });

    return this.prisma.subscription.delete({
      where: { id, user_id: userId },
    });
  }

  // --- Product Services ---
  async getProductServices(userId: string) {
    return this.prisma.productService.findMany({
      where: { user_id: userId },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async createProductService(userId: string, data: CreateProductServiceDto) {
    const { name, category_id } = data;
    return this.prisma.productService.create({
      data: {
        name,
        category_id,
        user_id: userId,
      },
    });
  }

  async updateProductService(userId: string, id: string, data: Partial<CreateProductServiceDto>) {
    const { name, category_id } = data;
    return this.prisma.productService.update({
      where: { id, user_id: userId },
      data: {
        name,
        category_id,
      },
    });
  }

  async deleteProductService(userId: string, id: string) {
    return this.prisma.productService.delete({
      where: { id, user_id: userId },
    });
  }
}
