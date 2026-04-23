import apiClient from './client';
import type {
  Quotation,
  QuotationItem,
  PaymentSchedule,
  CreateQuotationRequest,
  UpdateQuotationRequest,
  CreateQuotationItemRequest,
  UpdateQuotationItemRequest,
  ChangeStatusRequest,
  GeneratePaymentScheduleRequest,
  PaymentScheduleItemRequest,
  PaginatedResponse,
} from '@/types';

export interface QuotationListParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const quotationsApi = {
  // Quotations CRUD
  list: (params?: QuotationListParams) =>
    apiClient.get<PaginatedResponse<Quotation>>('/quotations', { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Quotation>(`/quotations/${id}`).then((r) => r.data),

  create: (data: CreateQuotationRequest) =>
    apiClient.post<Quotation>('/quotations', data).then((r) => r.data),

  update: (id: string, data: UpdateQuotationRequest) =>
    apiClient.patch<Quotation>(`/quotations/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/quotations/${id}`).then((r) => r.data),

  duplicate: (id: string) =>
    apiClient.post<Quotation>(`/quotations/${id}/duplicate`).then((r) => r.data),

  changeStatus: (id: string, data: ChangeStatusRequest) =>
    apiClient.patch<Quotation>(`/quotations/${id}/status`, data).then((r) => r.data),

  // PDF
  downloadPdf: (id: string) =>
    apiClient.get(`/quotations/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),

  previewPdf: (id: string) =>
    apiClient.post(`/quotations/${id}/pdf/preview`, {}, { responseType: 'blob' }).then((r) => r.data),

  // Items
  addItem: (quotationId: string, data: CreateQuotationItemRequest) =>
    apiClient.post<QuotationItem>(`/quotations/${quotationId}/items`, data).then((r) => r.data),

  updateItem: (quotationId: string, itemId: string, data: UpdateQuotationItemRequest) =>
    apiClient.patch<QuotationItem>(`/quotations/${quotationId}/items/${itemId}`, data).then((r) => r.data),

  deleteItem: (quotationId: string, itemId: string) =>
    apiClient.delete(`/quotations/${quotationId}/items/${itemId}`).then((r) => r.data),

  reorderItems: (quotationId: string, itemIds: string[]) =>
    apiClient.patch(`/quotations/${quotationId}/items/reorder`, { itemIds }).then((r) => r.data),

  // Payment Schedule
  putPaymentSchedule: (quotationId: string, items: PaymentScheduleItemRequest[]) =>
    apiClient.put<PaymentSchedule[]>(`/quotations/${quotationId}/payment-schedule`, items).then((r) => r.data),

  deletePaymentSchedule: (quotationId: string) =>
    apiClient.delete(`/quotations/${quotationId}/payment-schedule`).then((r) => r.data),

  generatePaymentSchedule: (quotationId: string, data: GeneratePaymentScheduleRequest) =>
    apiClient.post<PaymentSchedule[]>(`/quotations/${quotationId}/payment-schedule/generate`, data).then((r) => r.data),
};
