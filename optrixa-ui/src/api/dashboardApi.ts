import axiosClient from './axiosClient';
import type { ApiResponse, DashboardSummary } from '../types/common.types';
import type { DailyBreakdownDto } from "../types/common.types.ts";

export const dashboardApi = {
  getSummary: async (params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<ApiResponse<DashboardSummary>> => {
    const response = await axiosClient.get('/Dashboard/summary', { params });
    return response.data;
  },
  getDailyBreakdown: async (
  year: number,
  month: number
  ): Promise<ApiResponse<DailyBreakdownDto>> => {
    const response = await axiosClient.get(
      `/Dashboard/daily/${year}/${month}`
    );
    return response.data;
  },
};