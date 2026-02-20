import api from './axios';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { phone: string; email?: string; password: string; fullName: string; role: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { phone: string; password?: string; otp?: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  me: () => api.get<ApiResponse<User>>('/auth/me'),
};
