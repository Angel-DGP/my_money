import { apiClient } from '../client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../entities/category/types/category.types';

export const CategoriesService = {
  async getAll(): Promise<Category[]> {
    throw new Error('Not implemented: CategoriesService.getAll');
    // const response = await apiClient.get<Category[]>('/categories');
    // return response.data;
  },

  async getById(id: string): Promise<Category> {
    throw new Error('Not implemented: CategoriesService.getById');
    // const response = await apiClient.get<Category>(`/categories/${id}`);
    // return response.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    throw new Error('Not implemented: CategoriesService.create');
    // const response = await apiClient.post<Category>('/categories', data);
    // return response.data;
  },

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    throw new Error('Not implemented: CategoriesService.update');
    // const response = await apiClient.patch<Category>(`/categories/${id}`, data);
    // return response.data;
  },

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented: CategoriesService.remove');
    // await apiClient.delete(`/categories/${id}`);
  }
};
