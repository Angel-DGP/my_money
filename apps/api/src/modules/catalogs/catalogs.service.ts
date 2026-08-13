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
    return this.prisma.subscription.findMany({
      where: { user_id: userId },
      include: { card: true, category: true },
      orderBy: { next_billing_date: 'asc' },
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

    if (data.duration_months && data.duration_months > 0) {
      const eventsToCreate = [];
      const currentDate = new Date(data.next_billing_date);

      for (let i = 0; i < data.duration_months; i++) {
        eventsToCreate.push({
          user_id: userId,
          amount: data.amount,
          type: "EXPENSE",
          date: new Date(currentDate),
          source_type: "SUBSCRIPTION",
          reference_id: subscription.id,
          description: `Suscripción: ${data.name}`,
          status: "PENDING",
        });

        if (data.billing_cycle === 'YEARLY') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      await this.prisma.cashflowEvent.createMany({ data: eventsToCreate });
    }

    return subscription;
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

    return this.prisma.subscription.update({
      where: { id, user_id: userId },
      data: updateData,
    });
  }

  async deleteSubscription(userId: string, id: string) {
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
