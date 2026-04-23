import apiClient from './client';
import type { TenantQuotationConfig, UpdateQuotationConfigRequest } from '@/types';

export const quotationConfigApi = {
  get: () =>
    apiClient.get<TenantQuotationConfig | null>('/quotation-config').then((r) => r.data),

  update: (data: UpdateQuotationConfigRequest) =>
    apiClient.put<TenantQuotationConfig>('/quotation-config', data).then((r) => r.data),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient
      .post<TenantQuotationConfig>('/quotation-config/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
