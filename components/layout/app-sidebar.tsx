'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/auth-store'
import {
  Home,
  FileText,
  Package,
  Users,
  Settings,
  Building2,
  Shield,
  UserCog,
  LayoutTemplate,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ADMIN_ROLE, CLIENT_ROLE } from '@/lib/permissions'

interface NavChild {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  allowedRoles?: string[]
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  /**
   * If set, only users whose role is in the list see the entry.
   * Omit to allow every authenticated user.
   */
  allowedRoles?: string[]
  children?: NavChild[]
}

/**
 * Navigation registry. The allowedRoles field maps 1:1 to what the backend's
 * permission guard will enforce — admin only touches tenants + users, client
 * owns the operational surface. Keep this in sync with lib/permissions.ts and
 * the route-level RequireRole layouts.
 */
const navItems: NavItem[] = [
  // Shared
  { title: 'Dashboard', href: '/dashboard', icon: Home },

  // Client (operational)
  {
    title: 'Cotizaciones',
    href: '/dashboard/quotations',
    icon: FileText,
    allowedRoles: [CLIENT_ROLE],
  },
  {
    title: 'Productos',
    href: '/dashboard/products',
    icon: Package,
    allowedRoles: [CLIENT_ROLE],
  },
  {
    title: 'Clientes',
    href: '/dashboard/clients',
    icon: Users,
    allowedRoles: [CLIENT_ROLE],
  },

  // Admin (platform)
  {
    title: 'Tenants',
    href: '/dashboard/admin/tenants',
    icon: Building2,
    allowedRoles: [ADMIN_ROLE],
  },
  {
    title: 'Usuarios',
    href: '/dashboard/admin/users',
    icon: UserCog,
    allowedRoles: [ADMIN_ROLE],
  },

  // Shared (self-service) + client-only children
  {
    title: 'Configuracion',
    href: '/dashboard/settings',
    icon: Settings,
    children: [
      { title: 'Perfil', href: '/dashboard/settings/profile', icon: User },
      {
        title: 'Empresa',
        href: '/dashboard/settings/company',
        icon: Building2,
        allowedRoles: [CLIENT_ROLE],
      },
      {
        title: 'Plantillas',
        href: '/dashboard/settings/templates',
        icon: LayoutTemplate,
        allowedRoles: [CLIENT_ROLE],
      },
    ],
  },
]

function filterForRole(items: NavItem[], role: string | undefined): NavItem[] {
  return items
    .filter((item) => !item.allowedRoles || (role && item.allowedRoles.includes(role)))
    .map((item) => {
      if (!item.children) return item
      const children = item.children.filter(
        (c) => !c.allowedRoles || (role && c.allowedRoles.includes(role)),
      )
      return { ...item, children }
    })
    // Drop parents whose children were all filtered out (and which have no
    // standalone route of their own).
    .filter((item) => !item.children || item.children.length > 0)
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const role = user?.role?.name
  const [expandedSections, setExpandedSections] = useState<string[]>([
    '/dashboard/settings',
  ])

  const toggleSection = (href: string) => {
    setExpandedSections((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  const filteredItems = filterForRole(navItems, role)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">CotizaPro</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className={cn(collapsed && 'mx-auto')}>
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          const isParentActive = item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href))
          const isExpanded = expandedSections.includes(item.href)

          if (item.children && item.children.length > 0) {
            return (
              <div key={item.href}>
                <button
                  onClick={() => !collapsed && toggleSection(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                    (isActive || isParentActive) && 'bg-accent text-accent-foreground',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent',
                          pathname === child.href
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        <child.icon className="h-4 w-4 shrink-0" />
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info footer */}
      {!collapsed && user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role?.name}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
