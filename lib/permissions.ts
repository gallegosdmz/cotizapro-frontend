/**
 * Role-based access helpers.
 *
 * Backend (cotation-saas NestJS) defines two roles now:
 *   - admin  → platform admin. Only manages tenants + client users.
 *   - client → operational user inside a tenant. Handles products,
 *              quotations, orders, shipments, notifications.
 *
 * The sidebar and route guards both read from here so there is a single
 * source of truth.
 */

export type RoleName = 'admin' | 'client' | (string & {})

export const ADMIN_ROLE: RoleName = 'admin'
export const CLIENT_ROLE: RoleName = 'client'

/**
 * Where to land a user after login / when bounced from a forbidden route.
 * The root /dashboard page itself is role-aware, so we point everyone there.
 */
export function roleHomePath(_role?: string | null): string {
  return '/dashboard'
}

export function isAdmin(role?: string | null): boolean {
  return role === ADMIN_ROLE
}

export function isClient(role?: string | null): boolean {
  return role === CLIENT_ROLE
}
