'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuotations, useDeleteQuotation, useDuplicateQuotation, useChangeQuotationStatus } from '@/lib/hooks/use-quotations'
import { quotationsApi } from '@/lib/api/quotations.api'
import { useAuthStore } from '@/lib/stores/auth-store'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Copy, Download, Trash2, FileText, ArrowRightLeft } from 'lucide-react'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import type { QuotationStatus } from '@/types'

const statusOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'SENT', label: 'Enviada' },
  { value: 'ACCEPTED', label: 'Aceptada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'EXPIRED', label: 'Expirada' },
  { value: 'CANCELLED', label: 'Cancelada' },
]

const transitions: Record<string, { label: string; status: QuotationStatus }[]> = {
  DRAFT: [
    { label: 'Enviar', status: 'SENT' },
    { label: 'Cancelar', status: 'CANCELLED' },
  ],
  SENT: [
    { label: 'Marcar aceptada', status: 'ACCEPTED' },
    { label: 'Marcar rechazada', status: 'REJECTED' },
    { label: 'Marcar expirada', status: 'EXPIRED' },
    { label: 'Cancelar', status: 'CANCELLED' },
  ],
}

export default function QuotationsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [offset, setOffset] = useState(0)
  const limit = 10

  const { data, isLoading } = useQuotations({
    limit,
    offset,
    search,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const deleteMutation = useDeleteQuotation()
  const duplicateMutation = useDuplicateQuotation()
  const changeStatusMutation = useChangeQuotationStatus()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; status: QuotationStatus; label: string } | null>(null)

  const handleDownloadPdf = async (id: string, number: string) => {
    const blob = await quotationsApi.downloadPdf(id)
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.download = `cotizacion-${number}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDuplicate = async (id: string) => {
    const result = await duplicateMutation.mutateAsync(id)
    router.push(`/dashboard/quotations/${result.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cotizaciones"
        description="Gestiona todas tus cotizaciones"
        actions={
          <Link href="/dashboard/quotations/new">
            <Button className="gap-2"><Plus className="h-4 w-4" />Nueva cotizacion</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por folio o cliente..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0) }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setOffset(0) }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !data?.data?.length ? (
        <EmptyState
          title="Sin cotizaciones"
          description="Crea tu primera cotizacion para empezar"
          icon={FileText}
          action={<Link href="/dashboard/quotations/new"><Button><Plus className="mr-2 h-4 w-4" />Nueva cotizacion</Button></Link>}
        />
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Link href={`/dashboard/quotations/${q.id}`} className="font-medium text-primary hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{q.clientName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatShortDate(q.date)}</TableCell>
                    <TableCell><StatusBadge status={q.status} /></TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(q.total), q.currency)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/quotations/${q.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />Ver detalle
                          </DropdownMenuItem>
                          {q.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/quotations/${q.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" />Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(q.id)}>
                            <Copy className="mr-2 h-4 w-4" />Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(q.id, q.quotationNumber)}>
                            <Download className="mr-2 h-4 w-4" />Descargar PDF
                          </DropdownMenuItem>
                          {transitions[q.status] && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger><ArrowRightLeft className="mr-2 h-4 w-4" />Cambiar status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {transitions[q.status].map((t) => (
                                    <DropdownMenuItem key={t.status} onClick={() => setStatusConfirm({ id: q.id, status: t.status, label: t.label })}>
                                      {t.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(q.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination total={data.meta.total} limit={data.meta.limit} offset={data.meta.offset} totalPages={data.meta.totalPages} onPageChange={setOffset} />
        </>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Eliminar cotizacion"
        description="Estas seguro de eliminar esta cotizacion? Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null) }}
      />

      {/* Status change confirm */}
      <ConfirmDialog
        open={!!statusConfirm}
        onOpenChange={() => setStatusConfirm(null)}
        title="Cambiar status"
        description={statusConfirm ? `${statusConfirm.label} esta cotizacion?` : ''}
        confirmLabel={statusConfirm?.label ?? 'Confirmar'}
        onConfirm={() => {
          if (statusConfirm) changeStatusMutation.mutate({ id: statusConfirm.id, data: { status: statusConfirm.status } })
          setStatusConfirm(null)
        }}
      />
    </div>
  )
}
