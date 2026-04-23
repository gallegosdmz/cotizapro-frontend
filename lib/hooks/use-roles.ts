'use client'

import { useQuery } from "@tanstack/react-query"
import { rolesApi } from "../api/roles.api"

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  })
}

export function useRoleByName(name: string) {
  return useQuery({
    queryKey: ['role', name],
    queryFn: () => rolesApi.getByName(name),
    enabled: !!name,
  })
}