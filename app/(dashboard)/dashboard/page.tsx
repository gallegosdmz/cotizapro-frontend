'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { isAdmin } from '@/lib/permissions'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { ClientDashboard } from '@/components/dashboard/client-dashboard'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  // While the store hydrates, the parent (dashboard)/layout.tsx already shows
  // its own spinner, so we can rely on user being defined here.
  if (!user) return null

  return isAdmin(user.role?.name) ? <AdminDashboard /> : <ClientDashboard />
}
