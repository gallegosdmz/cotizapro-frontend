'use client'

import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quotationSchema, type QuotationFormData } from '@/lib/validations/quotation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, ChevronDown, Loader2, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ProductPickerDialog } from './product-picker-dialog'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { quotationTemplatesApi } from '@/lib/api/quotation-templates.api'

interface QuotationFormProps {
  defaultValues?: Partial<QuotationFormData>
  onSubmit: (data: QuotationFormData) => Promise<void>
  isSubmitting: boolean
}

export function QuotationForm({ defaultValues, onSubmit, isSubmitting }: QuotationFormProps) {
  const [productPickerIndex, setProductPickerIndex] = useState<number | null>(null)
  const { data: templates } = useQuery({
    queryKey: ['quotation-templates'],
    queryFn: () => quotationTemplatesApi.list({ limit: 50 }),
  })

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      currency: 'USD',
      taxRate: 0.16,
      discount: 0,
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const items = useWatch({ control: form.control, name: 'items' }) ?? []
  const taxRate = useWatch({ control: form.control, name: 'taxRate' }) ?? 0
  const globalDiscount = useWatch({ control: form.control, name: 'discount' }) ?? 0
  const currency = useWatch({ control: form.control, name: 'currency' }) ?? 'USD'

  // Calculate totals for preview
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0
    const price = Number(item?.unitPrice) || 0
    const disc = Number(item?.discount) || 0
    return sum + (qty * price - disc)
  }, 0)
  const afterDiscount = subtotal - (Number(globalDiscount) || 0)
  const taxAmount = afterDiscount * (Number(taxRate) || 0)
  const total = afterDiscount + taxAmount

  const errors = form.formState.errors

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nombre / Razon social *</Label>
              <Input {...form.register('clientName')} />
              {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contacto (Atencion a)</Label>
              <Input {...form.register('clientContact')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register('clientEmail')} />
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input {...form.register('clientPhone')} />
            </div>
            <div className="space-y-2">
              <Label>Direccion</Label>
              <Input {...form.register('clientAddress')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commercial Terms */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                Condiciones comerciales
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={form.watch('currency')} onValueChange={(v) => form.setValue('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Metodo de pago</Label>
                  <Input {...form.register('paymentMethod')} placeholder="Ej: Credito directo" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Terminos de pago</Label>
                  <Textarea {...form.register('paymentTerms')} placeholder="Ej: $35,990 USD anticipo, resto a 18 MSI" />
                </div>
                <div className="space-y-2">
                  <Label>Tiempo de entrega</Label>
                  <Input {...form.register('deliveryTime')} placeholder="Ej: 10 a 12 semanas" />
                </div>
                <div className="space-y-2">
                  <Label>Terminos de entrega</Label>
                  <Input {...form.register('deliveryTerms')} placeholder="Ej: DDP en instalaciones del cliente" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Garantia</Label>
                  <Textarea {...form.register('warrantyTerms')} />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items de la cotizacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setProductPickerIndex(index)}>
                    <Package className="mr-1 h-3 w-3" />Catalogo
                  </Button>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Producto *</Label>
                  <Input {...form.register(`items.${index}.productName`)} placeholder="Nombre del producto" />
                  {errors.items?.[index]?.productName && <p className="text-xs text-destructive">{errors.items[index].productName?.message}</p>}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Descripcion</Label>
                  <Textarea {...form.register(`items.${index}.description`)} rows={2} placeholder="Especificaciones tecnicas" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cantidad</Label>
                  <Input type="number" min={1} {...form.register(`items.${index}.quantity`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Precio unitario</Label>
                  <Input type="number" step="0.01" min={0} {...form.register(`items.${index}.unitPrice`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Descuento</Label>
                  <Input type="number" step="0.01" min={0} {...form.register(`items.${index}.discount`)} />
                </div>
                <div className="flex items-end">
                  <p className="text-sm font-medium">
                    Subtotal: {formatCurrency(
                      (Number(items[index]?.quantity) || 0) * (Number(items[index]?.unitPrice) || 0) - (Number(items[index]?.discount) || 0),
                      currency
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}>
            <Plus className="h-4 w-4" />Agregar item
          </Button>

          {/* Totals summary */}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-muted-foreground whitespace-nowrap">Descuento global</Label>
              <Input type="number" step="0.01" className="w-32 text-right" {...form.register('discount')} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-muted-foreground whitespace-nowrap">Tasa IVA</Label>
              <Input type="number" step="0.01" className="w-32 text-right" {...form.register('taxRate')} placeholder="0.16" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuesto</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Config */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between">
                Configuracion adicional
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input type="date" {...form.register('date')} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de expiracion</Label>
                  <Input type="date" {...form.register('expirationDate')} />
                </div>
                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Select value={form.watch('templateId') || 'none'} onValueChange={(v) => form.setValue('templateId', v === 'none' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Sin plantilla" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plantilla</SelectItem>
                      {templates?.data?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas (visibles en PDF)</Label>
                <Textarea {...form.register('notes')} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <p className="text-xs text-muted-foreground">No se incluyen en el PDF</p>
                <Textarea {...form.register('internalNotes')} rows={3} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cotizacion
        </Button>
      </div>

      {/* Product picker */}
      <ProductPickerDialog
        open={productPickerIndex !== null}
        onOpenChange={() => setProductPickerIndex(null)}
        onSelect={(product) => {
          if (productPickerIndex !== null) {
            form.setValue(`items.${productPickerIndex}.productName`, product.name)
            form.setValue(`items.${productPickerIndex}.unitPrice`, Number(product.unitPrice))
            form.setValue(`items.${productPickerIndex}.productId`, product.id)
            form.setValue(`items.${productPickerIndex}.description`, product.description)
          }
          setProductPickerIndex(null)
        }}
      />
    </form>
  )
}
