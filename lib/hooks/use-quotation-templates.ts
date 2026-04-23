'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationTemplatesApi } from '@/lib/api/quotation-templates.api'
import type { CreateQuotationTemplateRequest, UpdateQuotationTemplateRequest, PaginationParams } from '@/types'
import { toast } from 'sonner'

export function useQuotationTemplates(params?: PaginationParams) {
  return useQuery({
    queryKey: ['quotation-templates', params],
    queryFn: () => quotationTemplatesApi.list(params),
  })
}

export function useQuotationTemplate(id: string) {
  return useQuery({
    queryKey: ['quotation-template', id],
    queryFn: () => quotationTemplatesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateQuotationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuotationTemplateRequest) => quotationTemplatesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation-templates'] })
      toast.success('Plantilla creada')
    },
  })
}

export function useUpdateQuotationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationTemplateRequest }) =>
      quotationTemplatesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation-templates'] })
      toast.success('Plantilla actualizada')
    },
  })
}

export function useDeleteQuotationTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationTemplatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation-templates'] })
      toast.success('Plantilla eliminada')
    },
  })
}
