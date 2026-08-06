import { apiClient } from '../client';
import type { InstitutionDto, CardDto, CardBrandDto, CardTypeDto, SubscriptionDto, ProductServiceDto } from '../dto/catalogs.dto';

export const CatalogsService = {
  // --- Institutions ---
  async getInstitutions(): Promise<InstitutionDto[]> {
    const response = await apiClient.get<InstitutionDto[]>('/catalogs/institutions');
    return response.data;
  },
  async createInstitution(data: any): Promise<InstitutionDto> {
    const response = await apiClient.post<InstitutionDto>('/catalogs/institutions', data);
    return response.data;
  },

  // --- Card Brands ---
  async getCardBrands(): Promise<CardBrandDto[]> {
    const response = await apiClient.get<CardBrandDto[]>('/catalogs/card-brands');
    return response.data;
  },
  async createCardBrand(data: any): Promise<CardBrandDto> {
    const response = await apiClient.post<CardBrandDto>('/catalogs/card-brands', data);
    return response.data;
  },

  // --- Card Types ---
  async getCardTypes(): Promise<CardTypeDto[]> {
    const response = await apiClient.get<CardTypeDto[]>('/catalogs/card-types');
    return response.data;
  },
  async createCardType(data: any): Promise<CardTypeDto> {
    const response = await apiClient.post<CardTypeDto>('/catalogs/card-types', data);
    return response.data;
  },

  // --- Cards ---
  async getCards(): Promise<CardDto[]> {
    const response = await apiClient.get<CardDto[]>('/catalogs/cards');
    return response.data;
  },
  async createCard(data: any): Promise<CardDto> {
    const response = await apiClient.post<CardDto>('/catalogs/cards', data);
    return response.data;
  },

  // Subscriptions
  async getSubscriptions(): Promise<SubscriptionDto[]> {
    const response = await apiClient.get<SubscriptionDto[]>('/catalogs/subscriptions');
    return response.data;
  },
  async createSubscription(data: any): Promise<SubscriptionDto> {
    const response = await apiClient.post<SubscriptionDto>('/catalogs/subscriptions', data);
    return response.data;
  },

  // Product Services
  async getProductServices(): Promise<ProductServiceDto[]> {
    const response = await apiClient.get<ProductServiceDto[]>('/catalogs/product-services');
    return response.data;
  },
  async createProductService(data: any): Promise<ProductServiceDto> {
    const response = await apiClient.post<ProductServiceDto>('/catalogs/product-services', data);
    return response.data;
  },
};
