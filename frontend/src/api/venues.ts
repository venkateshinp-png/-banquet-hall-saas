import api from './axios';
import type { ApiResponse, Venue, VenuePricing } from '../types';

export const venueApi = {
  create: (hallId: number, data: any) =>
    api.post<ApiResponse<Venue>>(`/halls/${hallId}/venues`, data),
  update: (hallId: number, venueId: number, data: any) =>
    api.put<ApiResponse<Venue>>(`/halls/${hallId}/venues/${venueId}`, data),
  getByHall: (hallId: number) =>
    api.get<ApiResponse<Venue[]>>(`/halls/${hallId}/venues`),
  get: (hallId: number, venueId: number) =>
    api.get<ApiResponse<Venue>>(`/halls/${hallId}/venues/${venueId}`),
  updatePricing: (hallId: number, venueId: number, data: VenuePricing[]) =>
    api.put<ApiResponse<void>>(`/halls/${hallId}/venues/${venueId}/pricing`, data),
  getPricing: (venueId: number, hallId: number, date: string) =>
    api.get<ApiResponse<VenuePricing[]>>(`/halls/${hallId}/venues/${venueId}/pricing`, { params: { date } }),
};
