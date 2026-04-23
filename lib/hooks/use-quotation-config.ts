'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationConfigApi } from '@/lib/api/quotation-config.api'
import type { UpdateQuotationConfigRequest } from '@/types'
import { toast } from 'sonner'

export function useQuotationConfig() {
  return useQuery({
    queryKey: ['quotation-config'],
    queryFn: () => quotationConfigApi.get(),
  })
}

export function useUpdateQuotationConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateQuotationConfigRequest) => quotationConfigApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation-config'] })
      toast.success('Configuracion guardada')
    },
  })
}

export function useUploadLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => quotationConfigApi.uploadLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotation-config'] })
      toast.success('Logo subido')
    },
  })
}
