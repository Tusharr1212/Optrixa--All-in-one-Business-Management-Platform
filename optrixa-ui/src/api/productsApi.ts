import axiosClient from './axiosClient';
import type { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/common.types';

export const productsApi = {
  getAll: async (params: PaginationParams): Promise<ApiResponse<PaginatedResult<Product>>> => {
    const response = await axiosClient.get('/Products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.get(`/Products/${id}`);
    return response.data;
  },

  create: async (dto: CreateProductDto): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.post('/Products', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateProductDto): Promise<ApiResponse<Product>> => {
    const response = await axiosClient.put(`/Products/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Products/${id}`);
    return response.data;
  },
};