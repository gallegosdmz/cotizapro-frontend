'use client'

import { useState } from 'react'
import {
  useQuotationTemplates,
  useCreateQuotationTemplate,
  useUpdateQuotationTemplate,
  useDeleteQuotationTemplate,
} from '@/lib/hooks/use-quotation-templates'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, LayoutTemplate } from 'lucide-react'
import type { QuotationTemplate, TemplateSection } from '@/types'

const defaultSections: TemplateSection[] = [
  { type: 'cover', order: 1, enabled: true },
  { type: 'detail', order: 2, enabled: true },
  { type: 'terms', order: 3, enabled: true },
  { type: 'bank_details', order: 4, enabled: false },
  { type: 'payment_schedule', order: 5, enabled: false },
  { type: 'back_page', order: 6, enabled: false },
]

const sectionLabels: Record<string, string> = {
  cover: 'Portada',
  detail: 'Detalle (items + condiciones)',
  terms: 'Terminos y condiciones',
  bank_details: 'Datos bancarios',
  payment_schedule: 'Tabla de amortizacion',
  back_page: 'Contraportada',
}

export default function TemplatesPage() {
  const { data, isLoading } = useQuotationTemplates({ limit: 50 })
  const createMutation = useCreateQuotationTemplate()
  const updateMutation = useUpdateQuotationTemplate()
  const deleteMutation = useDeleteQuotationTemplate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<QuotationTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QuotationTemplate | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [sections, setSections] = useState<TemplateSection[]>(defaultSections)

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setIsDefault(false)
    setSections(defaultSections)
    setDialogOpen(true)
  }

  const openEdit = (t: QuotationTemplate) => {
    setEditing(t)
    setName(t.name)
    setDescription(t.description ?? '')
    setIsDefault(t.isDefault)
    setSections(t.sections?.length ? t.sections : defaultSections)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const payload = { name, description: description || undefined, isDefault, sections }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setDialogOpen(false)
  }

  const toggleSection = (index: number) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], enabled: !updated[index].enabled }
    setSections(updated)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantillas de cotizacion"
        description="Define que secciones incluir en los PDFs"
        actions={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nueva plantilla</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : !data?.data?.length ? (
        <EmptyState
          title="Sin plantillas"
          description="Crea una plantilla para personalizar tus PDFs"
          icon={LayoutTemplate}
          action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva plantilla</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {t.name}
                    {t.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </CardTitle>
                  {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(t)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {t.sections?.filter((s) => s.enabled).map((s) => (
                    <Badge key={s.type} variant="outline" className="text-xs">{sectionLabels[s.type] ?? s.type}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar plantilla' : 'Nueva plantilla'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Plantilla por defecto</Label>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
            <div className="space-y-2">
              <Label>Secciones</Label>
              <div className="space-y-2 rounded-lg border p-3">
                {sections.map((s, i) => (
                  <div key={s.type} className="flex items-center justify-between">
                    <span className="text-sm">{sectionLabels[s.type] ?? s.type}</span>
                    <Switch checked={s.enabled} onCheckedChange={() => toggleSection(i)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!name || createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Eliminar plantilla"
        description={`Eliminar "${deleteTarget?.name}"?`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null) }}
      />
    </div>
  )
}
