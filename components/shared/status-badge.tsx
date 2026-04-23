import { Badge } from '@/components/ui/badge'
import type { QuotationStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig: Record<QuotationStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Borrador', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  SENT: { label: 'Enviada', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  ACCEPTED: { label: 'Aceptada', className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  EXPIRED: { label: 'Expirada', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}

export function StatusBadge({ status }: { status: QuotationStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
