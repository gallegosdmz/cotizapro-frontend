import apiClient from './client';
import type { Role } from '@/types';

export const rolesApi = {
  list: () =>
    apiClient.get<Role[]>('/roles').then((r) => r.data),

  getByName: (name: string) =>
    apiClient.get<Role>(`/roles/${name}`).then((r) => r.data),
};
