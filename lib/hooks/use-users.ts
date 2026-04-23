'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users.api'
import type {
  CreateClientRequest,
  UpdateUserRequest,
  UpdateSelfRequest,
  PaginationParams,
} from '@/types'
import { toast } from 'sonner'

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

/**
 * Admin-only: create a new client user attached to a tenant.
 */
export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateClientRequest) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Cliente creado')
    },
  })
}

/**
 * Admin-only: update any user. Can reassign tenant (tenantId: null unassigns)
 * and change role.
 */
export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['user'] })
      toast.success('Usuario actualizado')
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuario eliminado')
    },
  })
}

/**
 * Self-service: edit your own profile. Never include tenantId/roleId.
 */
export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSelfRequest) => usersApi.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Perfil actualizado')
    },
  })
}
