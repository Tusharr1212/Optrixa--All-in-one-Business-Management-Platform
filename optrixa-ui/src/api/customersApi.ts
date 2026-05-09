import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common.types';

export interface Customer {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  createdAt: string;
}

export interface CreateCustomerDto {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customersApi = {
  getAll: async (search?: string): Promise<ApiResponse<Customer[]>> => {
    const response = await axiosClient.get('/Customers', {
      params: search ? { search } : undefined,
    });
    return response.data;
  },

  create: async (dto: CreateCustomerDto): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.post('/Customers', dto);
    return response.data;
  },

  update: async (
    id: number,
    dto: CreateCustomerDto
  ): Promise<ApiResponse<Customer>> => {
    const response = await axiosClient.put(`/Customers/${id}`, { ...dto, id });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Customers/${id}`);
    return response.data;
  },
};