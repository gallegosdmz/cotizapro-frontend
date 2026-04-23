'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationsApi, type QuotationListParams } from '@/lib/api/quotations.api'
import type {
  CreateQuotationRequest,
  UpdateQuotationRequest,
  CreateQuotationItemRequest,
  UpdateQuotationItemRequest,
  ChangeStatusRequest,
  GeneratePaymentScheduleRequest,
  PaymentScheduleItemRequest,
} from '@/types'
import { toast } from 'sonner'

export function useQuotations(params?: QuotationListParams) {
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: () => quotationsApi.list(params),
  })
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuotationRequest) => quotationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] })
      toast.success('Cotizacion creada')
    },
  })
}

export function useUpdateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['quotations'] })
      qc.invalidateQueries({ queryKey: ['quotation', id] })
      toast.success('Cotizacion actualizada')
    },
  })
}

export function useDeleteQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] })
      toast.success('Cotizacion eliminada')
    },
  })
}

export function useDuplicateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.duplicate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] })
      toast.success('Cotizacion duplicada')
    },
  })
}

export function useChangeQuotationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStatusRequest }) =>
      quotationsApi.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['quotations'] })
      qc.invalidateQueries({ queryKey: ['quotation', id] })
      toast.success('Status actualizado')
    },
  })
}

// Items
export function useAddQuotationItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: string; data: CreateQuotationItemRequest }) =>
      quotationsApi.addItem(quotationId, data),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
    },
  })
}

export function useUpdateQuotationItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      quotationId,
      itemId,
      data,
    }: {
      quotationId: string
      itemId: string
      data: UpdateQuotationItemRequest
    }) => quotationsApi.updateItem(quotationId, itemId, data),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
    },
  })
}

export function useDeleteQuotationItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quotationId, itemId }: { quotationId: string; itemId: string }) =>
      quotationsApi.deleteItem(quotationId, itemId),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
    },
  })
}

export function useReorderQuotationItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quotationId, itemIds }: { quotationId: string; itemIds: string[] }) =>
      quotationsApi.reorderItems(quotationId, itemIds),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
    },
  })
}

// Payment schedule
export function useGeneratePaymentSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: string; data: GeneratePaymentScheduleRequest }) =>
      quotationsApi.generatePaymentSchedule(quotationId, data),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
      toast.success('Tabla de amortizacion generada')
    },
  })
}

export function usePutPaymentSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ quotationId, items }: { quotationId: string; items: PaymentScheduleItemRequest[] }) =>
      quotationsApi.putPaymentSchedule(quotationId, items),
    onSuccess: (_, { quotationId }) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
      toast.success('Tabla de amortizacion actualizada')
    },
  })
}

export function useDeletePaymentSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (quotationId: string) => quotationsApi.deletePaymentSchedule(quotationId),
    onSuccess: (_, quotationId) => {
      qc.invalidateQueries({ queryKey: ['quotation', quotationId] })
      toast.success('Tabla de amortizacion eliminada')
    },
  })
}
