'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { LoginForm } from '@/components/auth/login-form'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
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

          <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <LoginForm onSuccess={() => router.push('/dashboard')} />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:bg-muted/50 lg:px-20">
        <div className="max-w-lg">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Crea cotizaciones profesionales en minutos
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Gestiona cotizaciones, genera PDFs y lleva el seguimiento de tus propuestas comerciales desde una sola plataforma.
          </p>
          <div className="mt-10 grid gap-4">
            <FeatureCard
              title="Multi-tenant"
              description="Cada empresa con su propia configuracion y branding"
            />
            <FeatureCard
              title="PDFs profesionales"
              description="Genera documentos listos para enviar a tus clientes"
            />
            <FeatureCard
              title="Seguimiento completo"
              description="Controla el estado de todas tus cotizaciones"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-background p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
