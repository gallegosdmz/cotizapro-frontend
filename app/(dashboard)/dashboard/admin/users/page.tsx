'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'

import {
  useUsers,
  useCreateClient,
  useUpdateUser,
  useDeleteUser,
} from '@/lib/hooks/use-users'
import { useTenants } from '@/lib/hooks/use-tenants'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { UserForm } from '@/components/admin/user-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatShortDate } from '@/lib/utils'
import type { User } from '@/types'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 10

  const { data, isLoading } = useUsers({ limit, offset })
  // Tenants for the create/edit selects. 100 is more than we'll ever need
  // for the in-form dropdown, and the backend supports soft pagination.
  const { data: tenantsData } = useTenants({ limit: 100, offset: 0 })
  const tenants = tenantsData?.data ?? []

  const createMutation = useCreateClient()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  // Client-side filter because the users endpoint doesn't take `search` yet.
  const filtered = data?.data?.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.tenant?.name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administra los clientes de la plataforma y su asignación a tenants"
        actions={
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setOffset(0)
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <EmptyState
          title="Sin usuarios"
          description="No hay usuarios registrados"
          icon={Users}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.tenant?.name ?? <span className="italic">Sin tenant</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.role?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge
                          variant={u.isVerified ? 'default' : 'secondary'}
                          className={
                            u.isVerified
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                              : ''
                          }
                        >
                          Email
                        </Badge>
                        <Badge
                          variant={u.isPhoneVerified ? 'default' : 'secondary'}
                          className={
                            u.isPhoneVerified
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                              : ''
                          }
                        >
                          Tel
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatShortDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(u)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(u)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            total={data!.meta.total}
            limit={data!.meta.limit}
            offset={data!.meta.offset}
            totalPages={data!.meta.totalPages}
            onPageChange={setOffset}
          />
        </>
      )}

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>
              Crea un usuario cliente y asígnalo a un tenant.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            mode="create"
            tenants={tenants}
            isSubmitting={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (payload) => {
              await createMutation.mutateAsync(payload)
              setCreateOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del usuario o reasígnalo a otro tenant.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <UserForm
              mode="edit"
              user={editing}
              tenants={tenants}
              isSubmitting={updateMutation.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={async (payload) => {
                await updateMutation.mutateAsync({ id: editing.id, data: payload })
                setEditing(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar usuario"
        description={
          deleteTarget
            ? `¿Seguro que quieres eliminar a ${deleteTarget.firstName} ${deleteTarget.lastName}? Esta acción realiza un soft delete.`
            : ''
        }
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
