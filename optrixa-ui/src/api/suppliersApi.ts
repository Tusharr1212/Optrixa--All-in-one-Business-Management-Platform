import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/common.types';

export interface SupplierExpense {
  id: number;
  title: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
  expenseDate: string;
  categoryName: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  expenses?: SupplierExpense[];
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

  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const response = await axiosClient.get(`/Suppliers/${id}`);
    return response.data;
  },

  create: async (dto: CreateSupplierDto): Promise<ApiResponse<Supplier>> => {
    const response = await axiosClient.post('/Suppliers', dto);
    return response.data;
  },

  update: async (
    id: number,
    dto: CreateSupplierDto
  ): Promise<ApiResponse<Supplier>> => {
    const response = await axiosClient.put(`/Suppliers/${id}`, {
      ...dto,
      id,
    });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.delete(`/Suppliers/${id}`);
    return response.data;
  },

  recordPayment: async (
    id: number,
    amount: number,
    notes?: string
  ): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.post(`/Suppliers/${id}/pay`, {
      amount,
      notes,
    });
    return response.data;
  },
};