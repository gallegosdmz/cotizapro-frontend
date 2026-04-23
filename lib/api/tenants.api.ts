import apiClient from './client';
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const tenantsApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Tenant>>('/tenants', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Tenant>(`/tenants/${id}`).then((r) => r.data),

  create: (data: CreateTenantRequest) =>
    apiClient.post<Tenant>('/tenants', data).then((r) => r.data),

  update: (id: string, data: UpdateTenantRequest) =>
    apiClient.patch<Tenant>(`/tenants/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/tenants/${id}`).then((r) => r.data),
};
