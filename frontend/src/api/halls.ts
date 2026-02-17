import api from './axios';
import type { ApiResponse, Hall } from '../types';

export const hallApi = {
  create: (data: any) => api.post<ApiResponse<Hall>>('/halls', data),
  update: (id: number, data: any) => api.put<ApiResponse<Hall>>(`/halls/${id}`, data),
  get: (id: number) => api.get<ApiResponse<Hall>>(`/halls/${id}`),
  getMy: () => api.get<ApiResponse<Hall[]>>('/halls/my'),
  uploadDocuments: (hallId: number, formData: FormData) =>
    api.post<ApiResponse<void>>(`/halls/${hallId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPending: () => api.get<ApiResponse<Hall[]>>('/halls/admin/pending'),
  updateStatus: (id: number, data: { status: string; notes?: string }) =>
    api.put<ApiResponse<Hall>>(`/halls/admin/${id}/status`, data),
};
