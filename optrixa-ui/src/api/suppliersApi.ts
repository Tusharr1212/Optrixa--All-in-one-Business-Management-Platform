import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common.types';

export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const suppliersApi = {
  getAll: async (): Promise<ApiResponse<Supplier[]>> => {
    const response = await axiosClient.get('/Suppliers');
    return response.data;
  },

  create: async (dto: CreateSupplierDto): Promise<ApiResponse<Supplier>> => {
    const response = await axiosClient.post('/Suppliers', dto);
    return response.data;
  },

  update: async (id: number, dto: CreateSupplierDto): Promise<ApiResponse<Supplier>> => {
    const response = await axiosClient.put(`/Suppliers/${id}`, { ...dto, id });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Suppliers/${id}`);
    return response.data;
  },
};