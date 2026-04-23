import apiClient from './client';
import type {
  QuotationTemplate,
  CreateQuotationTemplateRequest,
  UpdateQuotationTemplateRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const quotationTemplatesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<QuotationTemplate>>('/quotation-templates', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<QuotationTemplate>(`/quotation-templates/${id}`).then((r) => r.data),

  create: (data: CreateQuotationTemplateRequest) =>
    apiClient.post<QuotationTemplate>('/quotation-templates', data).then((r) => r.data),

  update: (id: string, data: UpdateQuotationTemplateRequest) =>
    apiClient.patch<QuotationTemplate>(`/quotation-templates/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/quotation-templates/${id}`).then((r) => r.data),
};
