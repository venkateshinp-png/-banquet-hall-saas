import api from './axios';
import type { ApiResponse, Booking } from '../types';

export const bookingApi = {
  create: (data: { venueId: number; bookingDate: string; startTime: string; endTime: string; paymentMode: string }) =>
    api.post<ApiResponse<Booking>>('/bookings', data),
  getMy: () => api.get<ApiResponse<Booking[]>>('/bookings/my'),
  getByHall: (hallId: number) => api.get<ApiResponse<Booking[]>>(`/bookings/hall/${hallId}`),
  get: (id: number) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  cancel: (id: number, reason: string) => api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }),
};
