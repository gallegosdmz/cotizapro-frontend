'use client'

import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/lib/api/roles.api'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield } from 'lucide-react'
import { useState } from 'react'
import type { Role } from '@/types'

export default function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const { data: roleDetail } = useQuery({
    queryKey: ['role', selectedRole?.name],
    queryFn: () => rolesApi.getByName(selectedRole!.name),
    enabled: !!selectedRole,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Roles y permisos del sistema" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles?.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-colors hover:border-primary ${selectedRole?.id === role.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedRole(role)}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{role.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {roleDetail?.permissions && (
        <Card>
          <CardHeader>
            <CardTitle>Permisos de: {roleDetail.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roleDetail.permissions.map((p) => (
                <Badge key={p.id} variant="outline">
                  {p.resource.slug}:{p.action}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
