'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuotationConfig, useUpdateQuotationConfig, useUploadLogo } from '@/lib/hooks/use-quotation-config'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import type { BankAccount, Branch, UpdateQuotationConfigRequest } from '@/types'

export default function CompanyConfigPage() {
  const { data: config, isLoading } = useQuotationConfig()
  const updateMutation = useUpdateQuotationConfig()
  const uploadLogoMutation = useUploadLogo()
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [primaryColor, setPrimaryColor] = useState('#1a5276')
  const [secondaryColor, setSecondaryColor] = useState('#2e86c1')
  const [quotationPrefix, setQuotationPrefix] = useState('COT')
  const [folioFormat, setFolioFormat] = useState('{prefix}-{date}-{seq}')
  const [nextSequentialNumber, setNextSequentialNumber] = useState(1)
  const [showCoverPage, setShowCoverPage] = useState(false)
  const [showTermsAndConditions, setShowTermsAndConditions] = useState(true)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false)
  const [showBackPage, setShowBackPage] = useState(false)
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [fiscalAddress, setFiscalAddress] = useState('')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [termsAndConditions, setTermsAndConditions] = useState('')
  const [defaultSignerName, setDefaultSignerName] = useState('')
  const [defaultSignerTitle, setDefaultSignerTitle] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (config) {
      setPrimaryColor(config.primaryColor || '#1a5276')
      setSecondaryColor(config.secondaryColor || '#2e86c1')
      setQuotationPrefix(config.quotationPrefix || 'COT')
      setFolioFormat(config.folioFormat || '{prefix}-{date}-{seq}')
      setNextSequentialNumber(config.nextSequentialNumber || 1)
      setShowCoverPage(config.showCoverPage)
      setShowTermsAndConditions(config.showTermsAndConditions)
      setShowBankDetails(config.showBankDetails)
      setShowPaymentSchedule(config.showPaymentSchedule)
      setShowBackPage(config.showBackPage)
      setLegalName(config.legalName || '')
      setTaxId(config.taxId || '')
      setFiscalAddress(config.fiscalAddress || '')
      setBankAccounts(config.bankAccounts || [])
      setBranches(config.branches || [])
      setTermsAndConditions(config.termsAndConditions || '')
      setDefaultSignerName(config.defaultSignerName || '')
      setDefaultSignerTitle(config.defaultSignerTitle || '')
      setWebsite(config.website || '')
    }
  }, [config])

  const handleSave = () => {
    const data: UpdateQuotationConfigRequest = {
      primaryColor, secondaryColor, quotationPrefix, folioFormat,
      nextSequentialNumber, showCoverPage, showTermsAndConditions,
      showBankDetails, showPaymentSchedule, showBackPage,
      legalName: legalName || undefined, taxId: taxId || undefined,
      fiscalAddress: fiscalAddress || undefined,
      bankAccounts: bankAccounts.length ? bankAccounts : undefined,
      branches: branches.length ? branches : undefined,
      termsAndConditions: termsAndConditions || undefined,
      defaultSignerName: defaultSignerName || undefined,
      defaultSignerTitle: defaultSignerTitle || undefined,
      website: website || undefined,
    }
    updateMutation.mutate(data)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadLogoMutation.mutate(file)
  }

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Configuracion de empresa"
        description="Personaliza la apariencia y datos de tus cotizaciones"
        actions={
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar todo
          </Button>
        }
      />

      <Tabs defaultValue="branding">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="folio">Folio</TabsTrigger>
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          <TabsTrigger value="bank">Banco</TabsTrigger>
          <TabsTrigger value="branches">Sucursales</TabsTrigger>
          <TabsTrigger value="terms">T&C</TabsTrigger>
          <TabsTrigger value="signature">Firma</TabsTrigger>
        </TabsList>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader><CardTitle>Branding</CardTitle><CardDescription>Logo y colores de tu empresa</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                {config?.logoPath && <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${config.logoPath}`} alt="Logo" className="h-16 object-contain rounded border p-2" />}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadLogoMutation.isPending}>
                  <Upload className="mr-2 h-4 w-4" />{uploadLogoMutation.isPending ? 'Subiendo...' : 'Subir logo'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color primario</Label>
                  <div className="flex gap-2">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
                    <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color secundario</Label>
                  <div className="flex gap-2">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
                    <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Folio */}
        <TabsContent value="folio">
          <Card>
            <CardHeader><CardTitle>Configuracion de folio</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prefijo</Label>
                  <Input value={quotationPrefix} onChange={(e) => setQuotationPrefix(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Siguiente numero</Label>
                  <Input type="number" value={nextSequentialNumber} onChange={(e) => setNextSequentialNumber(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Formato de folio</Label>
                <Input value={folioFormat} onChange={(e) => setFolioFormat(e.target.value)} />
                <p className="text-xs text-muted-foreground">Variables: {'{prefix}'}, {'{date}'}, {'{seq}'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Sections */}
        <TabsContent value="sections">
          <Card>
            <CardHeader><CardTitle>Secciones del PDF</CardTitle><CardDescription>Activa o desactiva secciones en el PDF generado</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Mostrar portada', value: showCoverPage, set: setShowCoverPage },
                { label: 'Mostrar terminos y condiciones', value: showTermsAndConditions, set: setShowTermsAndConditions },
                { label: 'Mostrar datos bancarios', value: showBankDetails, set: setShowBankDetails },
                { label: 'Mostrar tabla de amortizacion', value: showPaymentSchedule, set: setShowPaymentSchedule },
                { label: 'Mostrar contraportada', value: showBackPage, set: setShowBackPage },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <Label>{item.label}</Label>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fiscal */}
        <TabsContent value="fiscal">
          <Card>
            <CardHeader><CardTitle>Datos fiscales</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Razon social</Label><Input value={legalName} onChange={(e) => setLegalName(e.target.value)} /></div>
              <div className="space-y-2"><Label>RFC</Label><Input value={taxId} onChange={(e) => setTaxId(e.target.value)} /></div>
              <div className="space-y-2"><Label>Direccion fiscal</Label><Textarea value={fiscalAddress} onChange={(e) => setFiscalAddress(e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank */}
        <TabsContent value="bank">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Datos bancarios</CardTitle><CardDescription>Cuentas para pago</CardDescription></div>
              <Button variant="outline" size="sm" onClick={() => setBankAccounts([...bankAccounts, { currency: 'MXN', bankName: '' }])}>
                <Plus className="mr-1 h-4 w-4" />Agregar cuenta
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankAccounts.map((acc, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cuenta {i + 1}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setBankAccounts(bankAccounts.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Moneda</Label><Input value={acc.currency} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], currency: e.target.value }; setBankAccounts(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">Banco</Label><Input value={acc.bankName} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], bankName: e.target.value }; setBankAccounts(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">Titular</Label><Input value={acc.accountHolder ?? ''} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], accountHolder: e.target.value }; setBankAccounts(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">No. Cuenta</Label><Input value={acc.accountNumber ?? ''} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], accountNumber: e.target.value }; setBankAccounts(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">CLABE</Label><Input value={acc.clabe ?? ''} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], clabe: e.target.value }; setBankAccounts(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">SWIFT</Label><Input value={acc.swift ?? ''} onChange={(e) => { const n = [...bankAccounts]; n[i] = { ...n[i], swift: e.target.value }; setBankAccounts(n) }} /></div>
                  </div>
                </div>
              ))}
              {!bankAccounts.length && <p className="py-4 text-center text-muted-foreground">Sin cuentas bancarias</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Sucursales</CardTitle></div>
              <Button variant="outline" size="sm" onClick={() => setBranches([...branches, { name: '', address: '' }])}>
                <Plus className="mr-1 h-4 w-4" />Agregar sucursal
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {branches.map((br, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sucursal {i + 1}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setBranches(branches.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">Nombre</Label><Input value={br.name} onChange={(e) => { const n = [...branches]; n[i] = { ...n[i], name: e.target.value }; setBranches(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">Tipo</Label><Input value={br.type ?? ''} placeholder="showroom, oficina, bodega" onChange={(e) => { const n = [...branches]; n[i] = { ...n[i], type: e.target.value }; setBranches(n) }} /></div>
                    <div className="space-y-1 col-span-2"><Label className="text-xs">Direccion</Label><Input value={br.address} onChange={(e) => { const n = [...branches]; n[i] = { ...n[i], address: e.target.value }; setBranches(n) }} /></div>
                    <div className="space-y-1"><Label className="text-xs">Telefono</Label><Input value={br.phone ?? ''} onChange={(e) => { const n = [...branches]; n[i] = { ...n[i], phone: e.target.value }; setBranches(n) }} /></div>
                  </div>
                </div>
              ))}
              {!branches.length && <p className="py-4 text-center text-muted-foreground">Sin sucursales</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terms */}
        <TabsContent value="terms">
          <Card>
            <CardHeader><CardTitle>Terminos y condiciones</CardTitle><CardDescription>Este texto aparecera en la pagina de T&C del PDF</CardDescription></CardHeader>
            <CardContent>
              <Textarea value={termsAndConditions} onChange={(e) => setTermsAndConditions(e.target.value)} rows={12} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signature */}
        <TabsContent value="signature">
          <Card>
            <CardHeader><CardTitle>Firma</CardTitle><CardDescription>Datos del firmante por defecto</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Nombre del firmante</Label><Input value={defaultSignerName} onChange={(e) => setDefaultSignerName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Cargo</Label><Input value={defaultSignerTitle} onChange={(e) => setDefaultSignerTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
