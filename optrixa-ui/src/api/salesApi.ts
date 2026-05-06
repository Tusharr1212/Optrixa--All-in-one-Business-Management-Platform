import axiosClient from './axiosClient';
import type { Sale, CreateSaleDto } from '../types/sale.types';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/common.types';

export const salesApi = {
  getAll: async (params: PaginationParams): Promise<ApiResponse<PaginatedResult<Sale>>> => {
    const response = await axiosClient.get('/Sales', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Sale>> => {
    const response = await axiosClient.get(`/Sales/${id}`);
    return response.data;
  },

  create: async (dto: CreateSaleDto): Promise<ApiResponse<Sale>> => {
    const response = await axiosClient.post('/Sales', dto);
    return response.data;
  },

  updateStatus: async (id: number, paymentStatus: string): Promise<ApiResponse<Sale>> => {
  const response = await axiosClient.patch(`/Sales/${id}/status`, { paymentStatus });
  return response.data;
},
};