'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { roleHomePath } from '@/lib/permissions'

interface RequireRoleProps {
  /** Single allowed role. Mutually exclusive with `roles`. */
  role?: string
  /** Allowed roles. Any match passes the guard. */
  roles?: string[]
  children: React.ReactNode
}

/**
 * Redirect-based route guard. Reads the current user from the auth store and
 * bounces unauthorized users back to their role's home page (not a generic
 * /dashboard, which itself is role-aware).
 *
 * The sidebar also hides forbidden entries — this guard is the belt to the
 * sidebar's suspenders, covering deep links and stale tabs.
 */
export function RequireRole({ role, roles, children }: RequireRoleProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const allowed = roles ?? (role ? [role] : [])

  useEffect(() => {
    if (isLoading || !user) return
    const currentRole = user.role?.name
    if (!currentRole || !allowed.includes(currentRole)) {
      toast.error('No tienes permisos para acceder a esta seccion')
      router.replace(roleHomePath(currentRole))
    }
  }, [user, isLoading, allowed, router])

  if (isLoading || !user) return null
  if (!allowed.includes(user.role?.name ?? '')) return null

  return <>{children}</>
}
