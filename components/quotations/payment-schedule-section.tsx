'use client'

import { useState } from 'react'
import { useGeneratePaymentSchedule, useDeletePaymentSchedule } from '@/lib/hooks/use-quotations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { generateScheduleSchema, type GenerateScheduleFormData } from '@/lib/validations/quotation'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { CalendarDays, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Quotation } from '@/types'

interface PaymentScheduleSectionProps {
  quotation: Quotation
}

export function PaymentScheduleSection({ quotation: q }: PaymentScheduleSectionProps) {
  const [generateOpen, setGenerateOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const generateMutation = useGeneratePaymentSchedule()
  const deleteMutation = useDeletePaymentSchedule()

  const form = useForm<GenerateScheduleFormData>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: {
      totalAmount: Number(q.total) || 0,
      downPayment: 0,
      numberOfInstallments: 12,
      startDate: new Date().toISOString().split('T')[0],
    },
  })

  const hasSchedule = q.paymentSchedule && q.paymentSchedule.length > 0

  const handleGenerate = async (data: GenerateScheduleFormData) => {
    await generateMutation.mutateAsync({
      quotationId: q.id,
      data: {
        totalAmount: data.totalAmount || undefined,
        downPayment: data.downPayment || undefined,
        numberOfInstallments: data.numberOfInstallments,
        startDate: data.startDate,
      },
    })
    setGenerateOpen(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(q.id)
    setDeleteConfirm(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Tabla de amortizacion
        </CardTitle>
        <div className="flex gap-2">
          {q.status === 'DRAFT' && (
            <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />{hasSchedule ? 'Regenerar' : 'Generar'}
            </Button>
          )}
          {hasSchedule && q.status === 'DRAFT' && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="mr-1 h-4 w-4" />Eliminar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasSchedule ? (
          <p className="py-8 text-center text-muted-foreground">
            No hay tabla de amortizacion.
            {q.status === 'DRAFT' && ' Genera una para incluir un plan de pagos.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No.</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.paymentSchedule!.map((ps) => (
                  <TableRow key={ps.id}>
                    <TableCell>{ps.installmentNumber}</TableCell>
                    <TableCell>{formatShortDate(ps.dueDate)}</TableCell>
                    <TableCell>{ps.label ?? `Mensualidad ${ps.installmentNumber}`}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(Number(ps.amount), q.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Generate dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar tabla de amortizacion</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
            <div className="space-y-2">
              <Label>Total</Label>
              <Input type="number" step="0.01" {...form.register('totalAmount')} />
            </div>
            <div className="space-y-2">
              <Label>Anticipo (opcional)</Label>
              <Input type="number" step="0.01" {...form.register('downPayment')} />
            </div>
            <div className="space-y-2">
              <Label>Numero de mensualidades</Label>
              <Input type="number" min={1} {...form.register('numberOfInstallments')} />
              {form.formState.errors.numberOfInstallments && <p className="text-sm text-destructive">{form.formState.errors.numberOfInstallments.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Input type="date" {...form.register('startDate')} />
              {form.formState.errors.startDate && <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setGenerateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Eliminar tabla de amortizacion"
        description="Estas seguro? Se eliminara toda la tabla de pagos."
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDelete}
      />
    </Card>
  )
}
