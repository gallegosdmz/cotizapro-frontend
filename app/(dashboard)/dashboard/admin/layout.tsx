'use client'

import { RequireRole } from '@/components/shared/require-role'
import { ADMIN_ROLE } from '@/lib/permissions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role={ADMIN_ROLE}>{children}</RequireRole>
}
