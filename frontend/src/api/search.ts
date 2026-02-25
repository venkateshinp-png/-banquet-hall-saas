import api from './axios';
import type { ApiResponse, Hall, PageResponse, ExternalHall } from '../types';

export const searchApi = {
  searchHalls: (params: Record<string, any>) =>
    api.get<ApiResponse<PageResponse<Hall>>>('/search/halls', { params }),
  
  searchExternalHalls: (lat: number, lng: number, radius?: number) =>
    api.get<ApiResponse<ExternalHall[]>>('/search/external-halls', { 
      params: { lat, lng, radius: radius || 5000 } 
    }),

  getExternalHallDetails: (placeId: string) =>
    api.get<ApiResponse<ExternalHall>>(`/search/external-halls/${placeId}`),
};
