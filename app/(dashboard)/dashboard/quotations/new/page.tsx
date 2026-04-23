'use client'

import { useRouter } from 'next/navigation'
import { useCreateQuotation } from '@/lib/hooks/use-quotations'
import { QuotationForm } from '@/components/quotations/quotation-form'
import { PageHeader } from '@/components/shared/page-header'
import type { QuotationFormData } from '@/lib/validations/quotation'

export default function NewQuotationPage() {
  const router = useRouter()
  const createMutation = useCreateQuotation()

  const handleSubmit = async (data: QuotationFormData) => {
    const result = await createMutation.mutateAsync({
      ...data,
      taxRate: data.taxRate ?? undefined,
      discount: data.discount ?? undefined,
      templateId: data.templateId || undefined,
    })
    router.push(`/dashboard/quotations/${result.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva cotizacion" description="Crea una nueva cotizacion para tu cliente" />
      <QuotationForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  )
}
