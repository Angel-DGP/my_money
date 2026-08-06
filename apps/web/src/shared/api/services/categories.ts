import { apiClient } from '../client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@entities/category';

export const CategoriesService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<Category[] >('/categories');
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<Category >(`/categories/${id}`);
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await apiClient.post<Category >('/categories', data);
    return response.data;
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await apiClient.patch<Category >(`/categories/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
