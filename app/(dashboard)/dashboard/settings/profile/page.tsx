'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useUpdateMe } from '@/lib/hooks/use-users'
import { usersApi } from '@/lib/api/users.api'
import { authApi } from '@/lib/api/auth.api'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations/user'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Phone } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const updateMutation = useUpdateMe()
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
      })
      setOtpPhone(user.phone ?? '')
    }
  }, [user, form])

  const onSubmit = async (data: UpdateProfileFormData) => {
    if (!user) return
    // Self-service: PATCH /users/me. Never include tenantId/roleId — backend
    // returns 400 "Only admins can change tenant or role".
    await updateMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
    })
    const updated = await usersApi.me()
    setUser(updated)
  }

  const handleSendOtp = async () => {
    if (!otpPhone) return
    setOtpSending(true)
    try {
      await authApi.sendOtp({ phone: otpPhone })
      toast.success('Codigo OTP enviado')
    } catch { /* handled by interceptor */ }
    finally { setOtpSending(false) }
  }

  const handleVerifyOtp = async () => {
    if (!otpPhone || !otpCode) return
    setOtpVerifying(true)
    try {
      await authApi.verifyOtp({ phone: otpPhone, code: otpCode })
      toast.success('Telefono verificado')
      const updated = await usersApi.me()
      setUser(updated)
      setOtpCode('')
    } catch { /* handled by interceptor */ }
    finally { setOtpVerifying(false) }
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Mi perfil" description="Actualiza tu informacion personal" />

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...form.register('firstName')} />
                {form.formState.errors.firstName && <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...form.register('lastName')} />
                {form.formState.errors.lastName && <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register('email')} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input {...form.register('phone')} placeholder="+52XXXXXXXXXX" />
              {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Rol: {user.role?.name}</Badge>
              {user.tenant && <Badge variant="outline">Tenant: {user.tenant.name}</Badge>}
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* OTP Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Verificacion de telefono
          </CardTitle>
          <CardDescription>
            {user.isPhoneVerified ? (
              <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" />Telefono verificado</span>
            ) : (
              'Verifica tu numero de telefono por SMS'
            )}
          </CardDescription>
        </CardHeader>
        {!user.isPhoneVerified && (
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={otpPhone}
                onChange={(e) => setOtpPhone(e.target.value)}
                placeholder="+52XXXXXXXXXX"
                className="flex-1"
              />
              <Button onClick={handleSendOtp} disabled={otpSending} variant="outline">
                {otpSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar codigo
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Codigo OTP"
                className="flex-1"
              />
              <Button onClick={handleVerifyOtp} disabled={otpVerifying}>
                {otpVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
