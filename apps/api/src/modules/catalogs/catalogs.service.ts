import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Institutions ---
  async getInstitutions(userId: string) {
    return this.prisma.institution.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });
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
    return this.prisma.cardBrand.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });
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

  // --- Card Types ---
  async getCardTypes(userId: string) {
    return this.prisma.cardType.findMany({
      where: { user_id: userId },
      orderBy: { name: 'asc' },
    });
  }

  async createCardType(userId: string, data: { name: string }) {
    return this.prisma.cardType.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async updateCardType(userId: string, id: string, data: { name: string }) {
    return this.prisma.cardType.update({
      where: { id, user_id: userId },
      data,
    });
  }

  async deleteCardType(userId: string, id: string) {
    return this.prisma.cardType.delete({
      where: { id, user_id: userId },
    });
  }

  // --- Cards ---
  async getCards(userId: string) {
    return this.prisma.card.findMany({
      where: { user_id: userId },
      include: { institution: true, brand: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCard(userId: string, data: { institution_id: string; name: string; brand_id: string; type_id: string; last_four: string }) {
    return this.prisma.card.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async updateCard(userId: string, id: string, data: { institution_id?: string; name?: string; brand_id?: string; type_id?: string; last_four?: string }) {
    return this.prisma.card.update({
      where: { id, user_id: userId },
      data,
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

  async createSubscription(userId: string, data: { category_id: string; card_id?: string; name: string; amount: number; currency: string; billing_cycle: string; next_billing_date: string; url?: string }) {
    const { is_active, ...cleanData } = data as any;
    return this.prisma.subscription.create({
      data: {
        ...cleanData,
        user_id: userId,
        next_billing_date: new Date(cleanData.next_billing_date),
      },
    });
  }

  async updateSubscription(userId: string, id: string, data: any) {
    const { is_active, ...cleanData } = data;
    if (cleanData.next_billing_date) {
      cleanData.next_billing_date = new Date(cleanData.next_billing_date);
    }
    return this.prisma.subscription.update({
      where: { id, user_id: userId },
      data: cleanData,
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

  async createProductService(userId: string, data: any) {
    const { name, category_id } = data;
    return this.prisma.productService.create({
      data: {
        name,
        category_id,
        user_id: userId,
      },
    });
  }

  async updateProductService(userId: string, id: string, data: any) {
    const { name, category_id } = data;
    return this.prisma.productService.update({
      where: { id, user_id: userId },
      data: { name, category_id },
    });
  }

  async deleteProductService(userId: string, id: string) {
    return this.prisma.productService.delete({
      where: { id, user_id: userId },
    });
  }
}
