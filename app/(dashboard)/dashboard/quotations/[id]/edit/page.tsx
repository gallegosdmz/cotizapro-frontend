'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuotation, useUpdateQuotation } from '@/lib/hooks/use-quotations'
import { QuotationForm } from '@/components/quotations/quotation-form'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import type { QuotationFormData } from '@/lib/validations/quotation'

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: quotation, isLoading } = useQuotation(id)
  const updateMutation = useUpdateQuotation()

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  if (!quotation) {
    return <p className="py-16 text-center text-muted-foreground">Cotizacion no encontrada</p>
  }

  if (quotation.status !== 'DRAFT') {
    router.replace(`/dashboard/quotations/${id}`)
    return null
  }

  const defaultValues: Partial<QuotationFormData> = {
    clientName: quotation.clientName,
    clientContact: quotation.clientContact ?? '',
    clientEmail: quotation.clientEmail ?? '',
    clientPhone: quotation.clientPhone ?? '',
    clientAddress: quotation.clientAddress ?? '',
    currency: quotation.currency,
    date: quotation.date?.split('T')[0],
    expirationDate: quotation.expirationDate?.split('T')[0] ?? '',
    taxRate: quotation.taxRate ? Number(quotation.taxRate) : undefined,
    discount: quotation.discount ? Number(quotation.discount) : undefined,
    notes: quotation.notes ?? '',
    internalNotes: quotation.internalNotes ?? '',
    paymentMethod: quotation.paymentMethod ?? '',
    paymentTerms: quotation.paymentTerms ?? '',
    deliveryTime: quotation.deliveryTime ?? '',
    deliveryTerms: quotation.deliveryTerms ?? '',
    warrantyTerms: quotation.warrantyTerms ?? '',
    templateId: quotation.templateId ?? '',
    items: quotation.items?.map((item) => ({
      productName: item.productName,
      description: item.description ?? '',
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: item.discount ? Number(item.discount) : undefined,
      productId: item.productId,
    })) ?? [],
  }

  const handleSubmit = async (data: QuotationFormData) => {
    const { items, ...rest } = data
    void items // items are managed separately in edit mode via the detail page
    await updateMutation.mutateAsync({
      id,
      data: {
        ...rest,
        taxRate: rest.taxRate ?? undefined,
        discount: rest.discount ?? undefined,
        templateId: rest.templateId || undefined,
      },
    })
    router.push(`/dashboard/quotations/${id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${quotation.quotationNumber}`}
        description="Modifica los datos de la cotizacion"
      />
      <QuotationForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  )
}
