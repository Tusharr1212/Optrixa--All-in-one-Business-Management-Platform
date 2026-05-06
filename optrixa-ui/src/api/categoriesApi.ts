import axiosClient from './axiosClient';
import type { ApiResponse, Category } from '../types/common.types';

export const categoriesApi = {
  getAll: async (type?: string): Promise<ApiResponse<Category[]>> => {
    const response = await axiosClient.get('/Categories', { params: { type } });
    return response.data;
  },

  create: async (dto: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await axiosClient.post('/Categories', dto);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Categories/${id}`);
    return response.data;
  },
};