'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuotation, useChangeQuotationStatus, useDuplicateQuotation, useDeleteQuotation } from '@/lib/hooks/use-quotations'
import { quotationsApi } from '@/lib/api/quotations.api'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Pencil, Copy, Download, Eye, Trash2, Send, CheckCircle,
  XCircle, Ban, MoreHorizontal, Calendar, User, Building2
} from 'lucide-react'
import { formatCurrency, formatDate, formatShortDate } from '@/lib/utils'
import { PaymentScheduleSection } from '@/components/quotations/payment-schedule-section'
import type { QuotationStatus } from '@/types'

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: quotation, isLoading } = useQuotation(id)
  const changeStatus = useChangeQuotationStatus()
  const duplicate = useDuplicateQuotation()
  const deleteQuotation = useDeleteQuotation()

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<{ status: QuotationStatus; label: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  if (!quotation) {
    return <p className="py-16 text-center text-muted-foreground">Cotizacion no encontrada</p>
  }

  const q = quotation
  const isDraft = q.status === 'DRAFT'

  const handleDownload = async () => {
    const blob = await quotationsApi.downloadPdf(id)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.download = `cotizacion-${q.quotationNumber}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handlePreview = async () => {
    const blob = await quotationsApi.previewPdf(id)
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    setPdfPreviewUrl(url)
  }

  const handleDuplicate = async () => {
    const result = await duplicate.mutateAsync(id)
    router.push(`/dashboard/quotations/${result.id}`)
  }

  const handleDelete = async () => {
    await deleteQuotation.mutateAsync(id)
    router.push('/dashboard/quotations')
  }

  const statusActions: { status: QuotationStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = []
  if (q.status === 'DRAFT') {
    statusActions.push({ status: 'SENT', label: 'Enviar al cliente', icon: Send })
    statusActions.push({ status: 'CANCELLED', label: 'Cancelar', icon: Ban })
  } else if (q.status === 'SENT') {
    statusActions.push({ status: 'ACCEPTED', label: 'Marcar aceptada', icon: CheckCircle })
    statusActions.push({ status: 'REJECTED', label: 'Marcar rechazada', icon: XCircle })
    statusActions.push({ status: 'CANCELLED', label: 'Cancelar', icon: Ban })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{q.quotationNumber}</h1>
            <StatusBadge status={q.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Creada el {formatDate(q.createdAt)}
            {q.createdBy && ` por ${q.createdBy.firstName} ${q.createdBy.lastName}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDraft && (
            <Button variant="outline" onClick={() => router.push(`/dashboard/quotations/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />Editar
            </Button>
          )}
          {statusActions.map((a) => (
            <Button key={a.status} variant="outline" onClick={() => setStatusConfirm({ status: a.status, label: a.label })}>
              <a.icon className="mr-2 h-4 w-4" />{a.label}
            </Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}><Eye className="mr-2 h-4 w-4" />Preview PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Descargar PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}><Copy className="mr-2 h-4 w-4" />Duplicar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" />Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{q.clientName}</p>
            {q.clientContact && <p className="text-muted-foreground">Attn: {q.clientContact}</p>}
            {q.clientEmail && <p className="text-muted-foreground">{q.clientEmail}</p>}
            {q.clientPhone && <p className="text-muted-foreground">{q.clientPhone}</p>}
            {q.clientAddress && <p className="text-muted-foreground">{q.clientAddress}</p>}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4" />Fechas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Fecha</span><span>{formatShortDate(q.date)}</span></div>
            {q.expirationDate && <div className="flex justify-between"><span className="text-muted-foreground">Expira</span><span>{formatShortDate(q.expirationDate)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Moneda</span><Badge variant="outline">{q.currency}</Badge></div>
          </CardContent>
        </Card>

        {/* Commercial terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4" />Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {q.paymentMethod && <div className="flex justify-between"><span className="text-muted-foreground">Pago</span><span>{q.paymentMethod}</span></div>}
            {q.deliveryTime && <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span>{q.deliveryTime}</span></div>}
            {q.deliveryTerms && <p className="text-muted-foreground">{q.deliveryTerms}</p>}
            {q.paymentTerms && <p className="text-muted-foreground">{q.paymentTerms}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="hidden md:table-cell">Descripcion</TableHead>
                  <TableHead className="text-right">Cant.</TableHead>
                  <TableHead className="text-right">P. Unit.</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.position}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(item.unitPrice), q.currency)}</TableCell>
                    <TableCell className="text-right">{item.discount ? formatCurrency(Number(item.discount), q.currency) : '-'}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(item.subtotal), q.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(Number(q.subtotal), q.currency)}</span></div>
            {Number(q.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Descuento</span><span>-{formatCurrency(Number(q.discount), q.currency)}</span></div>}
            {q.taxRate && <div className="flex justify-between"><span className="text-muted-foreground">IVA ({(Number(q.taxRate) * 100).toFixed(0)}%)</span><span>{formatCurrency(Number(q.taxAmount), q.currency)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(Number(q.total), q.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment schedule */}
      <PaymentScheduleSection quotation={q} />

      {/* Notes */}
      {(q.notes || q.internalNotes) && (
        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {q.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Notas generales</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.notes}</p>
              </div>
            )}
            {q.internalNotes && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">Notas internas</p>
                  <Badge variant="secondary" className="text-xs">Solo interno</Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.internalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span>ID: {q.id}</span>
            <span>Creado: {formatDate(q.createdAt)}</span>
            <span>Actualizado: {formatDate(q.updatedAt)}</span>
            {q.template && <span>Plantilla: {q.template.name}</span>}
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview modal */}
      <Dialog open={!!pdfPreviewUrl} onOpenChange={() => { if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl); setPdfPreviewUrl(null) }}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {pdfPreviewUrl && <iframe src={pdfPreviewUrl} className="w-full h-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Status confirm */}
      <ConfirmDialog
        open={!!statusConfirm}
        onOpenChange={() => setStatusConfirm(null)}
        title="Cambiar status"
        description={`${statusConfirm?.label} esta cotizacion?`}
        confirmLabel={statusConfirm?.label ?? 'Confirmar'}
        onConfirm={() => {
          if (statusConfirm) changeStatus.mutate({ id, data: { status: statusConfirm.status } })
          setStatusConfirm(null)
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Eliminar cotizacion"
        description="Estas seguro? Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
