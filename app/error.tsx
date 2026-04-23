'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">Error</h1>
      <p className="text-muted-foreground max-w-md">{error.message || 'Algo salio mal'}</p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  )
}
