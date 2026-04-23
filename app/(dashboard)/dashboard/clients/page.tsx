'use client'

import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Gestion de clientes" />
      <EmptyState
        title="Proximamente"
        description="El modulo de clientes estara disponible pronto. Por ahora, los datos de clientes se capturan directamente en cada cotizacion."
        icon={Users}
      />
    </div>
  )
}
