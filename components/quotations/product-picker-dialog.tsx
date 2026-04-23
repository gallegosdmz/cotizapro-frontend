'use client'

import { useState } from 'react'
import { useProducts } from '@/lib/hooks/use-products'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (product: Product) => void
}

export function ProductPickerDialog({ open, onOpenChange, onSelect }: ProductPickerDialogProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useProducts({ limit: 20, search })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar producto del catalogo</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar producto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : !data?.data?.length ? (
            <p className="py-8 text-center text-muted-foreground">No se encontraron productos</p>
          ) : (
            data.data.map((p) => (
              <Button
                key={p.id}
                variant="ghost"
                className="w-full justify-between h-auto py-3 px-4"
                onClick={() => onSelect(p)}
              >
                <div className="text-left">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(Number(p.unitPrice))}</span>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
