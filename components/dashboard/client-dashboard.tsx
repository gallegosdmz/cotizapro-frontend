'use client'

import Link from 'next/link'
import { Plus, FileText, Send, CheckCircle, Clock } from 'lucide-react'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useQuotations } from '@/lib/hooks/use-quotations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Landing for the operational (client) role. Focused on quotations —
 * matches the client permission set (products, quotations, orders, …).
 */
export function ClientDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: allQuotations, isLoading } = useQuotations({ limit: 100, offset: 0 })
  const { data: recentData } = useQuotations({ limit: 5, offset: 0 })

  const stats = {
    total: allQuotations?.meta?.total ?? 0,
    draft: 0,
    sent: 0,
    accepted: 0,
  }

  if (allQuotations?.data) {
    for (const q of allQuotations.data) {
      if (q.status === 'DRAFT') stats.draft++
      if (q.status === 'SENT') stats.sent++
      if (q.status === 'ACCEPTED') stats.accepted++
    }
  }

  const kpis = [
    { title: 'Total cotizaciones', value: stats.total, icon: FileText, color: 'text-blue-600' },
    { title: 'Borradores', value: stats.draft, icon: Clock, color: 'text-slate-600' },
    { title: 'Enviadas', value: stats.sent, icon: Send, color: 'text-amber-600' },
    { title: 'Aceptadas', value: stats.accepted, icon: CheckCircle, color: 'text-green-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona y crea tus cotizaciones
          </p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cotizacion
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold">{kpi.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cotizaciones recientes</CardTitle>
          <Link href="/dashboard/quotations">
            <Button variant="outline" size="sm">Ver todas</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentData?.data?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay cotizaciones aun.{' '}
              <Link href="/dashboard/quotations/new" className="text-primary hover:underline">
                Crea tu primera cotizacion
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folio</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentData.data.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/quotations/${q.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {q.quotationNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{q.clientName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatShortDate(q.date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={q.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(q.total), q.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
