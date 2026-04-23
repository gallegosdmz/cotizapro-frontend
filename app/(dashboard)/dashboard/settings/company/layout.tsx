'use client'

import { RequireRole } from '@/components/shared/require-role'
import { CLIENT_ROLE } from '@/lib/permissions'

export default function CompanySettingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole role={CLIENT_ROLE}>{children}</RequireRole>
}
