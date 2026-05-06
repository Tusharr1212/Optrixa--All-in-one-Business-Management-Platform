import axiosClient from './axiosClient';
import type { LoginDto, AuthResponse } from '../types/auth.types';
import type { ApiResponse } from '../types/common.types';

export const authApi = {
  login: async (dto: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosClient.post<ApiResponse<AuthResponse>>('/Auth/login', dto);
    return response.data;
  },
};