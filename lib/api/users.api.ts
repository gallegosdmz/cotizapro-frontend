import apiClient from './client';
import type {
  User,
  CreateClientRequest,
  UpdateUserRequest,
  UpdateSelfRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const usersApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  me: () =>
    apiClient.get<User>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateSelfRequest) =>
    apiClient.patch<User>('/users/me', data).then((r) => r.data),

  deleteMe: () =>
    apiClient.delete('/users/me').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateClientRequest) =>
    apiClient.post<User>('/users', data).then((r) => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/users/${id}`).then((r) => r.data),
};
