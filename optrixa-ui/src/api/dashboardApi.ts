import axiosClient from './axiosClient';
import type { ApiResponse, DashboardSummary } from '../types/common.types';

export const dashboardApi = {
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    const response = await axiosClient.get('/Dashboard/summary');
    return response.data;
  },
};