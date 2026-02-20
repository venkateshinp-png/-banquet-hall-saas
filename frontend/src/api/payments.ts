import api from './axios';
import type { ApiResponse, Payment } from '../types';

export const paymentApi = {
  createIntent: (data: { bookingId: number; amount: number; paymentType: string }) =>
    api.post<ApiResponse<Payment>>('/payments/create-intent', data),
  confirm: (paymentIntentId: string) =>
    api.post<ApiResponse<Payment>>('/payments/confirm', { paymentIntentId }),
  refund: (bookingId: number, amount?: number) =>
    api.post<ApiResponse<Payment>>(`/payments/${bookingId}/refund`, { amount }),
  getByBooking: (bookingId: number) =>
    api.get<ApiResponse<Payment[]>>(`/payments/booking/${bookingId}`),
};
