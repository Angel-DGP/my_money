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

  // --- Subscriptions ---
  async getSubscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { user_id: userId },
      include: { card: true, category: true },
      orderBy: { next_billing_date: 'asc' },
    });
  }

  async createSubscription(userId: string, data: { category_id: string; card_id?: string; name: string; amount: number; currency: string; billing_cycle: string; next_billing_date: string; url?: string }) {
    return this.prisma.subscription.create({
      data: {
        ...data,
        user_id: userId,
        next_billing_date: new Date(data.next_billing_date),
      },
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

  async createProductService(userId: string, data: { category_id: string; name: string }) {
    return this.prisma.productService.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }
}
