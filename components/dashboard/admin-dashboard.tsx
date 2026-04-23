'use client'

import Link from 'next/link'
import { Building2, UserCog, Plus } from 'lucide-react'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useTenants } from '@/lib/hooks/use-tenants'
import { useUsers } from '@/lib/hooks/use-users'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Platform admin landing. Deliberately scoped to tenants + client users —
 * no products/quotations widgets here because the admin role has no
 * permissions on those resources and a stray fetch would trip a 403.
 */
export function AdminDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    limit: 100,
    offset: 0,
  })
  const { data: usersData, isLoading: usersLoading } = useUsers({
    limit: 100,
    offset: 0,
  })

  const tenantCount = tenantsData?.meta?.total ?? tenantsData?.data?.length ?? 0
  const userCount = usersData?.meta?.total ?? usersData?.data?.length ?? 0

  // Group users by tenant client-side. Good enough for a dashboard widget; if
  // it ever gets slow we should ask backend for a dedicated count endpoint.
  const usersByTenant = new Map<string, { name: string; count: number }>()
  let unassigned = 0
  for (const u of usersData?.data ?? []) {
    if (!u.tenant) {
      unassigned++
      continue
    }
    const existing = usersByTenant.get(u.tenant.id)
    if (existing) existing.count++
    else usersByTenant.set(u.tenant.id, { name: u.tenant.name, count: 1 })
  }
  const tenantRows = Array.from(usersByTenant.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {user?.firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Panel de administración de la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/tenants">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear tenant
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Crear cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tenants activos
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {tenantsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{tenantCount}</p>
            )}
            <Link
              href="/dashboard/admin/tenants"
              className="mt-2 inline-block text-xs text-primary hover:underline"
            >
              Administrar tenants →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios totales
            </CardTitle>
            <UserCog className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{userCount}</p>
            )}
            <Link
              href="/dashboard/admin/users"
              className="mt-2 inline-block text-xs text-primary hover:underline"
            >
              Administrar usuarios →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios por tenant</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : tenantRows.length === 0 && unassigned === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aún no hay usuarios registrados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead className="text-right">Usuarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                  {unassigned > 0 && (
                    <TableRow>
                      <TableCell className="italic text-muted-foreground">
                        Sin tenant
                      </TableCell>
                      <TableCell className="text-right">{unassigned}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
