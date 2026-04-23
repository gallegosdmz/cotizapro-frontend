import apiClient from './client';
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const productsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: CreateProductRequest) =>
    apiClient.post<Product>('/products', data).then((r) => r.data),

  update: (id: string, data: UpdateProductRequest) =>
    apiClient.patch<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),
};
