'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createClientSchema,
  adminUpdateUserSchema,
  type CreateClientFormData,
  type AdminUpdateUserFormData,
} from '@/lib/validations/user'
import type {
  CreateClientRequest,
  UpdateUserRequest,
  Tenant,
  User,
  Role,
} from '@/types'
import { useRoles } from '@/lib/hooks/use-roles'

/**
 * Radix Select can't use '' as a value, so we map the "unassigned" option
 * to this sentinel and translate at submit time. The backend accepts
 * tenantId: null to unassign.
 */
export const NO_TENANT_VALUE = '__none__'
export const NO_ROLE_VALUE = '__none__'

interface CreateUserFormProps {
  mode: 'create'
  tenants: Tenant[]
  onSubmit: (data: CreateClientRequest) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
}

interface EditUserFormProps {
  mode: 'edit'
  user: User
  tenants: Tenant[]
  onSubmit: (data: UpdateUserRequest) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
}

type Props = CreateUserFormProps | EditUserFormProps

export function UserForm(props: Props) {
  if (props.mode === 'create') return <CreateForm {...props} />
  return <EditForm {...props} />
}

function CreateForm({ tenants, onSubmit, onCancel, isSubmitting }: CreateUserFormProps) {
  const { data: rolesData } = useRoles();

  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      tenantId: '',
      roleId: undefined,
    },
  })

  const submit = form.handleSubmit(async (values) => {
    const payload: CreateClientRequest = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      tenantId: values.tenantId,
      roleId: values.roleId,
    }
    if (values.phone) payload.phone = values.phone
    if (values.roleId) payload.roleId = values.roleId
    await onSubmit(payload)
  })

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldText label="Nombre" error={form.formState.errors.firstName?.message}>
          <Input {...form.register('firstName')} />
        </FieldText>
        <FieldText label="Apellido" error={form.formState.errors.lastName?.message}>
          <Input {...form.register('lastName')} />
        </FieldText>
      </div>

      <FieldText label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" {...form.register('email')} />
      </FieldText>

      <FieldText
        label="Contraseña"
        error={form.formState.errors.password?.message}
        hint="Mínimo 8 caracteres"
      >
        <Input type="password" {...form.register('password')} />
      </FieldText>

      <FieldText
        label="Teléfono"
        error={form.formState.errors.phone?.message}
        hint="Opcional. Formato: +52XXXXXXXXXX"
      >
        <Input {...form.register('phone')} placeholder="+52XXXXXXXXXX" />
      </FieldText>

      <FieldText label="Tenant" error={form.formState.errors.tenantId?.message}>
        <TenantSelect
          value={form.watch('tenantId')}
          onChange={(v) => form.setValue('tenantId', v, { shouldValidate: true })}
          tenants={tenants}
          allowNone={false}
        />
      </FieldText>

      <FieldText label="Rol" error={form.formState.errors.roleId?.message} hint="Opcional. Por defecto se asigna 'client'">
        <RoleSelect
          value={form.watch('roleId') ?? ''}
          onChange={(v) => form.setValue('roleId', v || undefined, { shouldValidate: true })}
          roles={rolesData ?? []}
          allowNone
        />
      </FieldText>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear cliente
        </Button>
      </div>
    </form>
  )
}

function EditForm({ user, tenants, onSubmit, onCancel, isSubmitting }: EditUserFormProps) {
  const { data: rolesData } = useRoles()
  const defaults = useMemo<AdminUpdateUserFormData>(
    () => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      tenantId: user.tenant?.id ?? user.tenantId ?? '',
      roleId: user.roleId ?? undefined,
    }),
    [user],
  )

  const form = useForm<AdminUpdateUserFormData>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [defaults, form])

  const submit = form.handleSubmit(async (values) => {
    const payload: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      // '' → null (explicit unassign)
      tenantId: values.tenantId === '' ? null : values.tenantId,
    }
    if (values.roleId) payload.roleId = values.roleId
    await onSubmit(payload)
  })

  const tenantValue = form.watch('tenantId')

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldText label="Nombre" error={form.formState.errors.firstName?.message}>
          <Input {...form.register('firstName')} />
        </FieldText>
        <FieldText label="Apellido" error={form.formState.errors.lastName?.message}>
          <Input {...form.register('lastName')} />
        </FieldText>
      </div>

      <FieldText label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" {...form.register('email')} />
      </FieldText>

      <FieldText
        label="Teléfono"
        error={form.formState.errors.phone?.message}
        hint="Opcional. Formato: +52XXXXXXXXXX"
      >
        <Input {...form.register('phone')} placeholder="+52XXXXXXXXXX" />
      </FieldText>

      <FieldText
        label="Tenant"
        error={form.formState.errors.tenantId?.message}
        hint='Selecciona "Sin tenant" para desasignar'
      >
        <TenantSelect
          value={tenantValue}
          onChange={(v) => form.setValue('tenantId', v, { shouldValidate: true })}
          tenants={tenants}
          allowNone
        />
      </FieldText>

      <FieldText label="Rol" error={form.formState.errors.roleId?.message}>
        <RoleSelect
          value={form.watch('roleId') ?? ''}
          onChange={(v) => form.setValue('roleId', v || undefined, { shouldValidate: true })}
          roles={rolesData ?? []}
          allowNone={false}
        />
      </FieldText>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

function FieldText({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function RoleSelect({
  value,
  onChange,
  roles,
  allowNone,
}: {
  value: string
  onChange: (v: string) => void
  roles: Role[]
  allowNone: boolean
}) {
  const displayValue = value === '' ? (allowNone ? NO_ROLE_VALUE : '') : value
  return (
    <Select
      value={displayValue || undefined}
      onValueChange={(v) => onChange(v === NO_ROLE_VALUE ? '' : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona un rol" />
      </SelectTrigger>
      <SelectContent>
        {allowNone && (
          <SelectItem value={NO_ROLE_VALUE}>Por defecto (client)</SelectItem>
        )}
        {roles.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function TenantSelect({
  value,
  onChange,
  tenants,
  allowNone,
}: {
  value: string
  onChange: (v: string) => void
  tenants: Tenant[]
  allowNone: boolean
}) {
  // Radix requires non-empty string values; map '' ↔ NO_TENANT_VALUE.
  const displayValue = value === '' ? (allowNone ? NO_TENANT_VALUE : '') : value
  return (
    <Select
      value={displayValue || undefined}
      onValueChange={(v) => onChange(v === NO_TENANT_VALUE ? '' : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecciona un tenant" />
      </SelectTrigger>
      <SelectContent>
        {allowNone && (
          <SelectItem value={NO_TENANT_VALUE}>Sin tenant</SelectItem>
        )}
        {tenants.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}