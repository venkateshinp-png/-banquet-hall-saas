import api from './axios';
import type { ApiResponse, Hall, PageResponse } from '../types';

export const searchApi = {
  searchHalls: (params: Record<string, any>) =>
    api.get<ApiResponse<PageResponse<Hall>>>('/search/halls', { params }),
};
