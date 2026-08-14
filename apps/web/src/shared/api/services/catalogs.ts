import { apiClient } from '../client';
import type { InstitutionDto, CardDto, CardBrandDto, SubscriptionDto, ProductServiceDto } from '../dto/catalogs.dto';

export const CatalogsService = {
  // --- Institutions ---
  async getInstitutions(): Promise<InstitutionDto[]> {
    const response = await apiClient.get<InstitutionDto[]>('/catalogs/institutions');
    return response.data;
  },
  async createInstitution(data: unknown): Promise<InstitutionDto> {
    const response = await apiClient.post<InstitutionDto>('/catalogs/institutions', data);
    return response.data;
  },
  async updateInstitution(id: string, data: unknown): Promise<InstitutionDto> {
    const response = await apiClient.put<InstitutionDto>(`/catalogs/institutions/${id}`, data);
    return response.data;
  },
  async deleteInstitution(id: string): Promise<void> {
    await apiClient.delete(`/catalogs/institutions/${id}`);
  },

  // --- Card Brands ---
  async getCardBrands(): Promise<CardBrandDto[]> {
    const response = await apiClient.get<CardBrandDto[]>('/catalogs/card-brands');
    return response.data;
  },
  async createCardBrand(data: unknown): Promise<CardBrandDto> {
    const response = await apiClient.post<CardBrandDto>('/catalogs/card-brands', data);
    return response.data;
  },
  async updateCardBrand(id: string, data: unknown): Promise<CardBrandDto> {
    const response = await apiClient.put<CardBrandDto>(`/catalogs/card-brands/${id}`, data);
    return response.data;
  },
  async deleteCardBrand(id: string): Promise<void> {
    await apiClient.delete(`/catalogs/card-brands/${id}`);
  },

  // --- Cards ---
  async getCards(): Promise<CardDto[]> {
    const response = await apiClient.get<CardDto[]>('/catalogs/cards');
    return response.data;
  },
  async createCard(data: unknown): Promise<CardDto> {
    const response = await apiClient.post<CardDto>('/catalogs/cards', data);
    return response.data;
  },
  async updateCard(id: string, data: unknown): Promise<CardDto> {
    const response = await apiClient.put<CardDto>(`/catalogs/cards/${id}`, data);
    return response.data;
  },
  async deleteCard(id: string): Promise<void> {
    await apiClient.delete(`/catalogs/cards/${id}`);
  },

  // Subscriptions
  async getSubscriptions(): Promise<SubscriptionDto[]> {
    const response = await apiClient.get<SubscriptionDto[]>('/catalogs/subscriptions');
    return response.data;
  },
  async createSubscription(data: unknown): Promise<SubscriptionDto> {
    const response = await apiClient.post<SubscriptionDto>('/catalogs/subscriptions', data);
    return response.data;
  },
  async updateSubscription(id: string, data: unknown): Promise<SubscriptionDto> {
    const response = await apiClient.put<SubscriptionDto>(`/catalogs/subscriptions/${id}`, data);
    return response.data;
  },
  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/catalogs/subscriptions/${id}`);
  },
  async paySubscriptionMonth(id: string, payload: { accountId: string; date?: string }): Promise<unknown> {
    const response = await apiClient.post(`/cashflow/subscriptions/${id}/pay`, payload);
    return response.data;
  },

  // Product Services
  async getProductServices(): Promise<ProductServiceDto[]> {
    const response = await apiClient.get<ProductServiceDto[]>('/catalogs/product-services');
    return response.data;
  },
  async createProductService(data: unknown): Promise<ProductServiceDto> {
    const response = await apiClient.post<ProductServiceDto>('/catalogs/product-services', data);
    return response.data;
  },
  async updateProductService(id: string, data: unknown): Promise<ProductServiceDto> {
    const response = await apiClient.put<ProductServiceDto>(`/catalogs/product-services/${id}`, data);
    return response.data;
  },
  async deleteProductService(id: string): Promise<void> {
    await apiClient.delete(`/catalogs/product-services/${id}`);
  },
};
