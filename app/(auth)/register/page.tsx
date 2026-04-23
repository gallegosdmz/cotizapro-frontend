'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { RegisterForm } from '@/components/auth/register-form'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  if (isAuthenticated) return null

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Cotation SaaS</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registrate para empezar a gestionar tus cotizaciones
          </p>

          <RegisterForm onSuccess={() => router.push('/dashboard')} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-muted/50 lg:px-20">
        <div className="max-w-lg">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Unete a Cotation SaaS
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Crea tu cuenta y comienza a generar cotizaciones profesionales para tus clientes.
          </p>
        </div>
      </div>
    </div>
  )
}
