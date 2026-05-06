import axiosClient from './axiosClient';
import type { Expense, CreateExpenseDto, UpdateExpenseDto } from '../types/expense.types';
import type { ApiResponse, PaginatedResult, PaginationParams } from '../types/common.types';

export const expensesApi = {
  getAll: async (params: PaginationParams): Promise<ApiResponse<PaginatedResult<Expense>>> => {
    const response = await axiosClient.get('/Expenses', { params });
    return response.data;
  },

  create: async (dto: CreateExpenseDto): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.post('/Expenses', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdateExpenseDto): Promise<ApiResponse<Expense>> => {
    const response = await axiosClient.put(`/Expenses/${id}`, dto);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Expenses/${id}`);
    return response.data;
  },
};