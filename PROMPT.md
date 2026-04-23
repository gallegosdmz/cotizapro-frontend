# Prompt: Implementación del Frontend — Cotation SaaS

## Contexto del Proyecto

Estás construyendo el frontend completo para un **SaaS de gestión de cotizaciones** (quotes/proposals). El backend ya está completamente implementado con NestJS 11 + TypeScript + PostgreSQL y expone una API REST. Tu trabajo es crear una aplicación frontend con **Next.js 14+ (App Router)** + **TypeScript** + **Tailwind CSS** que consuma todos los endpoints de esta API.

### Qué es este sistema

Es una plataforma multi-tenant donde empresas (tenants) pueden:
- Crear y gestionar cotizaciones profesionales para sus clientes
- Agregar productos a las cotizaciones con precios, cantidades y descuentos
- Generar PDFs profesionales y descargables de las cotizaciones
- Configurar la apariencia de sus cotizaciones (branding, colores, logo)
- Gestionar tablas de amortización (planes de pago a meses)
- Administrar un catálogo de productos por tenant
- Manejar usuarios con roles y permisos (RBAC)

### Roles del sistema

| Rol | Permisos |
|-----|----------|
| **admin** | CRUD completo en: users, products, tenants, quotations, orders, shipments, notifications |
| **client** | CREATE+READ en quotations y orders. READ en shipments y notifications |

### Stack tecnológico requerido para el frontend

- **Next.js 14+** con App Router (`app/` directory)
- **TypeScript** estricto
- **Tailwind CSS** para estilos
- **shadcn/ui** como librería de componentes (basada en Radix UI)
- **React Hook Form** + **Zod** para formularios y validación
- **TanStack Query (React Query)** para data fetching y cache
- **Axios** para cliente HTTP
- **Zustand** para estado global (auth, user session)
- **Lucide React** para iconos
- **next-themes** para dark mode
- **sonner** para notificaciones toast

---

## Configuración del Backend (API)

```
Base URL: http://localhost:3000/api
CORS: Habilitado (origin: *)
Auth: Bearer Token (JWT) en header Authorization
Prefijo global: /api
```

Todas las rutas (excepto login y register) requieren el header:
```
Authorization: Bearer <jwt_token>
```

Las rutas protegidas por RBAC validan que el usuario tenga el permiso `(resource, action)` correspondiente según su rol. Si no tiene permiso, el backend devuelve `403 Forbidden`.

### Formato de respuesta de paginación

Todos los endpoints de listado devuelven:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "totalPages": 10
  }
}
```

Query params de paginación: `?limit=10&offset=0&search=texto`

### Formato de errores

```json
{
  "statusCode": 400,
  "message": "Mensaje de error" | ["array", "de", "errores"],
  "error": "Bad Request"
}
```

---

## API Reference — Todos los Endpoints

### 1. Autenticación (`/api/auth`)

#### POST `/api/auth/register` — Registro de usuario
**No requiere auth.**
```typescript
// Request body
{
  email: string,         // requerido, formato email
  password: string,      // requerido, min 8 caracteres
  firstName: string,     // requerido, min 1 char
  lastName: string,      // requerido, min 1 char
  phone?: string         // opcional, formato mexicano: +52XXXXXXXXXX o 52XXXXXXXXXX o XXXXXXXXXX (10 dígitos)
}

// Response 201
{
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  isVerified: boolean,
  isPhoneVerified: boolean,
  token: string           // JWT token para usar en Authorization header
}
```

#### POST `/api/auth/login` — Inicio de sesión
**No requiere auth.**
```typescript
// Request body
{
  email: string,
  password: string
}

// Response 201
{
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  isVerified: boolean,
  isPhoneVerified: boolean,
  token: string
}
```

#### GET `/api/auth/refresh` — Verificar token y obtener datos actualizados
**Requiere JWT.**
```typescript
// Response 200
{
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  isVerified: boolean,
  isPhoneVerified: boolean,
  token: string           // token renovado
}
```

#### POST `/api/auth/send-otp` — Enviar código OTP por SMS
**Requiere JWT.**
```typescript
// Request body
{ phone: string }

// Response 201
{ message: string }
```

#### POST `/api/auth/verify-otp` — Verificar código OTP
**Requiere JWT.**
```typescript
// Request body
{ phone: string, code: string }

// Response 201
{ message: string }
```

---

### 2. Usuarios (`/api/users`)

#### GET `/api/users` — Listar usuarios (paginado)
**Requiere JWT.**
```
Query: ?limit=10&offset=0&search=texto
```
```typescript
// Response 200
{
  data: IUser[],
  meta: { total, limit, offset, totalPages }
}
```

#### GET `/api/users/me` — Obtener perfil del usuario autenticado
**Requiere JWT.**
```typescript
// Response 200 — IUser
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  phone?: string,
  isVerified: boolean,
  isPhoneVerified: boolean,
  roleId: string,
  role: { id, name, description },
  tenant?: { id, name },
  createdAt: string,
  updatedAt: string,
  isDeleted: boolean
}
```

#### GET `/api/users/:id` — Obtener usuario por ID
**Requiere JWT.**

#### PATCH `/api/users/:id` — Actualizar usuario
**Requiere JWT. Solo el propio usuario puede editar su perfil.**
```typescript
// Request body (todos opcionales)
{
  email?: string,
  password?: string,
  firstName?: string,
  lastName?: string,
  phone?: string
}
```

#### DELETE `/api/users/:id` — Eliminar usuario (soft delete)
**Requiere JWT. Solo el propio usuario puede eliminar su cuenta.**

---

### 3. Roles (`/api/roles`)

#### GET `/api/roles` — Listar todos los roles
**Requiere JWT.**
```typescript
// Response 200
[
  { id: string, name: string, description: string }
]
```

#### GET `/api/roles/:name` — Obtener rol con permisos
**Requiere JWT.**
```typescript
// Response 200
{
  id: string,
  name: string,
  description: string,
  permissions: [
    { id, action: "CREATE"|"READ"|"UPDATE"|"DELETE", resource: { id, name, slug } }
  ]
}
```

---

### 4. Tenants (`/api/tenants`)

#### POST `/api/tenants` — Crear tenant
**Requiere JWT + permiso `tenants:CREATE`.**
```typescript
// Request body
{ name: string }    // min 1 char, unique

// Response 201
{ id, name, createdAt, updatedAt, isDeleted }
```

#### GET `/api/tenants` — Listar tenants (paginado)
**Requiere JWT + permiso `tenants:READ`.**
```
Query: ?limit=10&offset=0&search=texto
```

#### GET `/api/tenants/:id` — Obtener tenant
**Requiere JWT + permiso `tenants:READ`.**

#### PATCH `/api/tenants/:id` — Actualizar tenant
**Requiere JWT + permiso `tenants:UPDATE`.**
```typescript
{ name?: string }
```

#### DELETE `/api/tenants/:id` — Eliminar tenant (soft delete)
**Requiere JWT + permiso `tenants:DELETE`.**

---

### 5. Productos (`/api/products`)

#### POST `/api/products` — Crear producto
**Requiere JWT + permiso `products:CREATE`.**
```typescript
// Request body
{
  name: string,          // min 1 char
  description: string,
  stock: number,         // entero
  unitPrice: number,     // decimal
  tenantId: string,      // UUID del tenant
  imagePath?: string     // ruta de imagen, opcional
}

// Response 201 — IProduct
{ id, name, description, stock, unitPrice, imagePath, createdAt, updatedAt, isDeleted }
```

#### GET `/api/products` — Listar productos (paginado)
**Requiere JWT + permiso `products:READ`.**
```
Query: ?limit=10&offset=0&search=nombre
```

#### GET `/api/products/:id` — Obtener producto
**Requiere JWT + permiso `products:READ`.**

#### PATCH `/api/products/:id` — Actualizar producto
**Requiere JWT + permiso `products:UPDATE`.**

#### DELETE `/api/products/:id` — Eliminar producto (soft delete)
**Requiere JWT + permiso `products:DELETE`.**

---

### 6. Cotizaciones (`/api/quotations`)

#### POST `/api/quotations` — Crear cotización (con ítems inline)
**Requiere JWT + permiso `quotations:CREATE`.**

El `tenantId` y `createdById` se toman automáticamente del usuario autenticado. El folio (`quotationNumber`) se genera automáticamente en el backend.

```typescript
// Request body
{
  date?: string,                // ISO date, default: hoy
  expirationDate?: string,      // ISO date, nullable
  currency?: string,            // default: "USD"
  taxRate?: number,             // ej: 0.16 para IVA 16%
  discount?: number,            // descuento global
  notes?: string,               // notas visibles en PDF
  internalNotes?: string,       // notas internas, NO van al PDF
  clientName: string,           // razón social del cliente (requerido)
  clientAddress?: string,
  clientContact?: string,       // "Atención a:"
  clientEmail?: string,
  clientPhone?: string,
  paymentMethod?: string,       // ej: "Crédito directo"
  paymentTerms?: string,        // ej: "$35,990 USD anticipo, resto a 18 MSI"
  deliveryTime?: string,        // ej: "10 a 12 semanas"
  deliveryTerms?: string,       // ej: "DDP en instalaciones del cliente"
  warrantyTerms?: string,
  templateId?: string,          // UUID de plantilla (opcional)
  items?: [                     // ítems inline (opcionales, se pueden agregar después)
    {
      productName: string,      // min 1 char
      description?: string,     // especificaciones técnicas
      quantity: number,         // entero, min 1
      unitPrice: number,        // decimal, min 0
      discount?: number,        // descuento por línea
      productId?: string        // referencia al producto del catálogo (opcional)
    }
  ]
}

// Response 201 — IQuotation
{
  id: string,
  quotationNumber: string,      // folio auto-generado, ej: "COT-260409-01"
  date: string,
  expirationDate: string | null,
  status: "DRAFT",              // siempre se crea como DRAFT
  currency: string,
  subtotal: number,             // calculado automáticamente
  taxRate: number | null,
  taxAmount: number | null,     // calculado
  discount: number | null,
  total: number,                // calculado
  notes, internalNotes, clientName, clientAddress, clientContact,
  clientEmail, clientPhone, paymentMethod, paymentTerms,
  deliveryTime, deliveryTerms, warrantyTerms,
  tenantId, createdById, templateId,
  items: IQuotationItem[],      // ítems creados con subtotal calculado
  createdAt, updatedAt, isDeleted
}
```

#### GET `/api/quotations` — Listar cotizaciones (paginado + filtros)
**Requiere JWT + permiso `quotations:READ`.**

Solo devuelve cotizaciones del tenant del usuario autenticado.

```
Query params:
  ?limit=10
  &offset=0
  &search=texto              (busca en quotationNumber y clientName)
  &status=DRAFT              (filtro por status: DRAFT|SENT|ACCEPTED|REJECTED|EXPIRED|CANCELLED)
  &clientName=Empresa        (filtro por nombre de cliente)
  &dateFrom=2026-01-01       (filtro fecha desde)
  &dateTo=2026-12-31         (filtro fecha hasta)
```

```typescript
// Response 200
{
  data: IQuotation[],   // sin items ni paymentSchedule en listado
  meta: { total, limit, offset, totalPages }
}
```

#### GET `/api/quotations/:id` — Obtener cotización con relaciones
**Requiere JWT + permiso `quotations:READ`.**
```typescript
// Response 200 — IQuotation con:
{
  ...quotation,
  items: IQuotationItem[],              // ordenados por position
  paymentSchedule: IPaymentSchedule[],  // ordenados por installmentNumber
  createdBy: { id, firstName, lastName, email },
  template: { id, name } | null
}
```

#### PATCH `/api/quotations/:id` — Actualizar cotización
**Requiere JWT + permiso `quotations:UPDATE`. Solo si status es DRAFT.**
```typescript
// Request body — todos los campos de crear son opcionales (excepto items, que se gestionan por separado)
{
  date?, expirationDate?, currency?, taxRate?, discount?,
  notes?, internalNotes?, clientName?, clientAddress?,
  clientContact?, clientEmail?, clientPhone?,
  paymentMethod?, paymentTerms?, deliveryTime?,
  deliveryTerms?, warrantyTerms?, templateId?
}

// Response 200 — IQuotation actualizada
```

> **Regla importante:** Si la cotización no está en DRAFT, devuelve 400: "Solo se pueden editar cotizaciones en estado DRAFT"

#### DELETE `/api/quotations/:id` — Eliminar cotización (soft delete)
**Requiere JWT + permiso `quotations:DELETE`.**

#### POST `/api/quotations/:id/duplicate` — Duplicar cotización
**Requiere JWT + permiso `quotations:CREATE`.**

Crea una nueva cotización en DRAFT con folio nuevo, fecha actual, y copia todos los ítems. Funciona desde cualquier status.

```typescript
// Response 201 — nueva IQuotation (DRAFT)
```

#### PATCH `/api/quotations/:id/status` — Cambiar status
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body
{ status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED" }

// Response 200 — IQuotation con status actualizado
```

**Transiciones de status permitidas:**
```
DRAFT    → SENT, CANCELLED
SENT     → ACCEPTED, REJECTED, CANCELLED, EXPIRED
ACCEPTED → (estado final, no se puede cambiar)
REJECTED → (estado final)
EXPIRED  → (estado final)
CANCELLED → (estado final)
```
Si la transición no es válida → 400: "No se puede cambiar de X a Y"

#### GET `/api/quotations/:id/pdf` — Descargar PDF
**Requiere JWT + permiso `quotations:READ`.**
```
Response: application/pdf (binary)
Content-Disposition: attachment; filename="cotizacion-COT-260409-01.pdf"
```

Para descargar: hacer GET con Authorization header y manejar como blob.

#### POST `/api/quotations/:id/pdf/preview` — Preview PDF (inline)
**Requiere JWT + permiso `quotations:READ`.**
```
Response: application/pdf (binary)
Content-Disposition: inline; filename="cotizacion-COT-260409-01.pdf"
```

Para preview: hacer POST, recibir blob, crear URL con `URL.createObjectURL(blob)` y mostrar en `<iframe>` o `<embed>`.

---

### 7. Ítems de Cotización (`/api/quotations/:quotationId/items`)

Todos requieren que la cotización esté en DRAFT. Si no → 400.

#### POST `/api/quotations/:quotationId/items` — Agregar ítem
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body
{
  productName: string,
  description?: string,
  quantity: number,       // entero, min 1
  unitPrice: number,      // decimal, min 0
  discount?: number,
  productId?: string
}

// Response 201 — IQuotationItem
{
  id, position, productName, description, quantity,
  unitPrice, discount, subtotal,  // subtotal = qty * price - discount
  productId, quotationId,
  createdAt, updatedAt, isDeleted
}
```
> Nota: después de agregar un ítem, los totales de la cotización se recalculan automáticamente en el backend.

#### PATCH `/api/quotations/:quotationId/items/:itemId` — Actualizar ítem
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
{ productName?, description?, quantity?, unitPrice?, discount?, productId? }
```

#### DELETE `/api/quotations/:quotationId/items/:itemId` — Eliminar ítem
**Requiere JWT + permiso `quotations:UPDATE`.**

#### PATCH `/api/quotations/:quotationId/items/reorder` — Reordenar ítems
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body
{ itemIds: string[] }   // array de UUIDs en el nuevo orden deseado
```

---

### 8. Tabla de Amortización (`/api/quotations/:quotationId/payment-schedule`)

#### PUT `/api/quotations/:quotationId/payment-schedule` — Crear/reemplazar schedule
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body — array de items
[
  { installmentNumber: 1, dueDate: "2026-05-01", amount: 35990, label: "Anticipo" },
  { installmentNumber: 2, dueDate: "2026-06-01", amount: 2994.16, label: "Mensualidad 1" },
  ...
]

// Response 200 — IPaymentSchedule[]
```

#### DELETE `/api/quotations/:quotationId/payment-schedule` — Eliminar schedule
**Requiere JWT + permiso `quotations:UPDATE`.**

#### POST `/api/quotations/:quotationId/payment-schedule/generate` — Auto-generar schedule
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body
{
  totalAmount?: number,        // si no se envía, usa el total de la cotización
  downPayment?: number,        // anticipo (opcional, si > 0 se agrega como primera línea)
  numberOfInstallments: number, // entero, min 1
  startDate: string            // ISO date
}

// Lógica del backend:
// installmentAmount = (totalAmount - downPayment) / numberOfInstallments
// Si hay downPayment → primera línea "Anticipo" con fecha = startDate
// Mensualidades con fechas mensuales consecutivas

// Response 201 — IPaymentSchedule[]
[
  { id, installmentNumber: 1, dueDate, amount: 35990, label: "Anticipo", quotationId },
  { id, installmentNumber: 2, dueDate, amount: 2994.16, label: "Mensualidad 1", quotationId },
  ...
]
```

---

### 9. Configuración de Cotizaciones por Tenant (`/api/quotation-config`)

#### GET `/api/quotation-config` — Obtener configuración
**Requiere JWT + permiso `quotations:READ`.**
```typescript
// Response 200 — ITenantQuotationConfig | null (null si no se ha configurado)
{
  id, logoPath, secondaryLogoPath,
  primaryColor: "#1a5276",
  secondaryColor: "#2e86c1",
  quotationPrefix: "COT",
  nextSequentialNumber: 1,
  folioFormat: "{prefix}-{date}-{seq}",
  showCoverPage: false,
  showTermsAndConditions: true,
  showBankDetails: false,
  showPaymentSchedule: false,
  showBackPage: false,
  termsAndConditions: string | null,
  bankAccounts: [
    { currency, bankName, accountHolder, accountNumber, clabe, branch, swift }
  ] | null,
  taxId, legalName, fiscalAddress,
  branches: [
    { name, address, phone, type }
  ] | null,
  website,
  defaultSignerName, defaultSignerTitle,
  tenantId, createdAt, updatedAt, isDeleted
}
```

#### PUT `/api/quotation-config` — Crear/actualizar configuración
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request body — todos opcionales
{
  primaryColor?, secondaryColor?,
  quotationPrefix?, nextSequentialNumber?, folioFormat?,
  showCoverPage?, showTermsAndConditions?, showBankDetails?,
  showPaymentSchedule?, showBackPage?,
  termsAndConditions?,
  bankAccounts?: [{ currency, bankName, accountHolder?, accountNumber?, clabe?, branch?, swift? }],
  taxId?, legalName?, fiscalAddress?,
  branches?: [{ name, address, phone?, type? }],
  website?,
  defaultSignerName?, defaultSignerTitle?
}
```

#### POST `/api/quotation-config/logo` — Subir logo
**Requiere JWT + permiso `quotations:UPDATE`.**
```typescript
// Request: multipart/form-data
// Field name: "file"
// Tipos permitidos: jpg, jpeg, png, gif, svg, webp
// Tamaño máximo: 5MB

// Response 200 — ITenantQuotationConfig actualizado con logoPath
```

---

### 10. Plantillas de Cotización (`/api/quotation-templates`)

#### POST `/api/quotation-templates` — Crear plantilla
**Requiere JWT + permiso `quotations:CREATE`.**
```typescript
// Request body
{
  name: string,
  description?: string,
  isDefault?: boolean,
  sections: [
    { type: "cover", order: 1, enabled: true },
    { type: "detail", order: 2, enabled: true },
    { type: "terms", order: 3, enabled: true },
    { type: "bank_details", order: 4, enabled: false },
    { type: "payment_schedule", order: 5, enabled: false },
    { type: "back_page", order: 6, enabled: false }
  ]
}

// Tipos de sección disponibles:
// "cover"             — Portada con imagen del producto
// "detail"            — Detalle con tabla de ítems + condiciones comerciales + totales
// "terms"             — Términos y condiciones
// "bank_details"      — Datos bancarios / forma de pedido
// "payment_schedule"  — Tabla de amortización
// "back_page"         — Contraportada con sucursales y contacto
```

#### GET `/api/quotation-templates` — Listar plantillas
**Requiere JWT + permiso `quotations:READ`.**
```
Query: ?limit=10&offset=0
```

#### GET `/api/quotation-templates/:id` — Obtener plantilla
**Requiere JWT + permiso `quotations:READ`.**

#### PATCH `/api/quotation-templates/:id` — Actualizar plantilla
**Requiere JWT + permiso `quotations:UPDATE`.**

#### DELETE `/api/quotation-templates/:id` — Eliminar plantilla
**Requiere JWT + permiso `quotations:DELETE`.**

---

## Tipos TypeScript para el Frontend

Crea un directorio `src/types/` con todos estos tipos. Usarlos en todo el proyecto:

```typescript
// src/types/auth.ts
interface AuthResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// src/types/user.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  roleId: string;
  role: Role;
  tenant?: Tenant;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// src/types/role.ts
interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: Permission[];
}

interface Permission {
  id: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  resource: Resource;
}

interface Resource {
  id: string;
  name: string;
  slug: string;
}

// src/types/tenant.ts
interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// src/types/product.ts
interface Product {
  id: string;
  name: string;
  description: string;
  stock: number;
  unitPrice: number;
  imagePath?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// src/types/quotation.ts
type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  expirationDate?: string;
  status: QuotationStatus;
  currency: string;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  total: number;
  notes?: string;
  internalNotes?: string;
  clientName: string;
  clientAddress?: string;
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  tenantId: string;
  createdById: string;
  templateId?: string;
  items?: QuotationItem[];
  paymentSchedule?: PaymentSchedule[];
  createdBy?: { id: string; firstName: string; lastName: string; email: string };
  template?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface QuotationItem {
  id: string;
  position: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  subtotal: number;
  productId?: string;
  quotationId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface PaymentSchedule {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  label?: string;
  quotationId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface TenantQuotationConfig {
  id: string;
  logoPath?: string;
  secondaryLogoPath?: string;
  primaryColor: string;
  secondaryColor: string;
  quotationPrefix: string;
  nextSequentialNumber: number;
  folioFormat: string;
  showCoverPage: boolean;
  showTermsAndConditions: boolean;
  showBankDetails: boolean;
  showPaymentSchedule: boolean;
  showBackPage: boolean;
  termsAndConditions?: string;
  bankAccounts?: BankAccount[];
  taxId?: string;
  legalName?: string;
  fiscalAddress?: string;
  branches?: Branch[];
  website?: string;
  defaultSignerName?: string;
  defaultSignerTitle?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface BankAccount {
  currency: string;
  bankName: string;
  accountHolder?: string;
  accountNumber?: string;
  clabe?: string;
  branch?: string;
  swift?: string;
}

interface Branch {
  name: string;
  address: string;
  phone?: string;
  type?: string;
}

interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  sections: TemplateSection[];
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

interface TemplateSection {
  type: 'cover' | 'detail' | 'terms' | 'bank_details' | 'payment_schedule' | 'back_page';
  order: number;
  enabled: boolean;
}

// src/types/common.ts
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}
```

---

## Fases de Implementación

### FASE 1 — Infraestructura y Autenticación

**Objetivo:** Setup del proyecto, configuración de providers, auth completo.

#### 1.1 Setup del proyecto
- Crear proyecto Next.js 14+ con App Router, TypeScript, Tailwind CSS
- Instalar dependencias: `shadcn/ui`, `react-hook-form`, `zod`, `@tanstack/react-query`, `axios`, `zustand`, `lucide-react`, `next-themes`, `sonner`
- Configurar `shadcn/ui` con tema oscuro/claro
- Crear estructura de directorios:
  ```
  src/
    app/
      (auth)/
        login/page.tsx
        register/page.tsx
      (dashboard)/
        layout.tsx              # sidebar + header + auth guard
        dashboard/page.tsx
        ...
      layout.tsx
      page.tsx                  # redirect to /login or /dashboard
    components/
      ui/                       # shadcn components
      layout/                   # Sidebar, Header, etc.
      shared/                   # DataTable, Pagination, ConfirmDialog, etc.
    lib/
      api/                      # Axios instance + API service functions
      hooks/                    # Custom hooks (useAuth, useQuotations, etc.)
      stores/                   # Zustand stores
      utils/                    # Formatters, helpers
      validations/              # Zod schemas
    types/                      # TypeScript interfaces
  ```

#### 1.2 Axios client y API layer
- Crear instancia de Axios con:
  - `baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'`
  - Interceptor de request que agrega `Authorization: Bearer <token>` desde Zustand store
  - Interceptor de response que maneja 401 → redirige a login y limpia la sesión
- Crear archivos de servicio por dominio: `auth.api.ts`, `users.api.ts`, `products.api.ts`, `tenants.api.ts`, `quotations.api.ts`, `quotation-config.api.ts`, `quotation-templates.api.ts`

#### 1.3 Auth store (Zustand)
```typescript
// Estado:
{ token, user, isAuthenticated, isLoading }

// Acciones:
login(email, password) → llama POST /api/auth/login → guarda token + user
register(data) → llama POST /api/auth/register → guarda token + user
logout() → limpia estado + redirige a /login
refresh() → llama GET /api/auth/refresh → actualiza token + user
initialize() → lee token de localStorage → intenta refresh → si falla: logout
```

- Persistir token en `localStorage`
- Al cargar la app, intentar `refresh` automáticamente

#### 1.4 Páginas de autenticación
- **Login page** (`/login`): formulario con email + password, link a registro
- **Register page** (`/register`): formulario con firstName, lastName, email, password, phone (opcional)
- Validación con Zod + React Hook Form
- Toasts de error/éxito con `sonner`
- Redirect a `/dashboard` después de login/register exitoso
- Si ya está autenticado, redirigir al dashboard

#### 1.5 Layout del dashboard
- **Sidebar** colapsable con navegación:
  - Dashboard (icono Home)
  - Cotizaciones (icono FileText) — la sección principal
  - Productos (icono Package)
  - Clientes (icono Users) — futuro, por ahora placeholder
  - Configuración (icono Settings)
    - Sub-items: Perfil, Empresa (tenant config), Plantillas
  - Admin (solo si rol = admin):
    - Usuarios
    - Tenants
    - Roles
- **Header** con:
  - Breadcrumbs
  - Theme toggle (dark/light)
  - Avatar con dropdown: perfil, cerrar sesión
- **Auth guard**: middleware/layout que verifica autenticación, si no → redirect a login

---

### FASE 2 — Dashboard y Módulos Básicos (Productos, Tenants, Usuarios)

**Objetivo:** Implementar las vistas CRUD para los módulos de soporte.

#### 2.1 Dashboard home (`/dashboard`)
- KPIs cards (puedes calcular en frontend con los datos del API):
  - Total cotizaciones
  - Cotizaciones en DRAFT
  - Cotizaciones enviadas (SENT)
  - Cotizaciones aceptadas (ACCEPTED)
- Tabla de últimas 5 cotizaciones recientes
- Acceso rápido: "Nueva cotización" button

#### 2.2 Módulo de Productos (`/dashboard/products`)
- **Lista de productos**: DataTable con columnas (nombre, descripción, stock, precio, acciones)
  - Paginación server-side
  - Búsqueda por nombre
  - Botones: editar, eliminar
- **Crear producto**: modal/drawer con formulario
- **Editar producto**: modal/drawer pre-llenado
- **Eliminar producto**: diálogo de confirmación

#### 2.3 Módulo de Tenants (`/dashboard/admin/tenants`) — Solo admin
- Lista paginada con búsqueda
- CRUD completo en modals

#### 2.4 Módulo de Usuarios (`/dashboard/admin/users`) — Solo admin
- Lista paginada de usuarios
- Ver detalle de usuario

#### 2.5 Perfil de usuario (`/dashboard/settings/profile`)
- Ver y editar: firstName, lastName, email, phone
- Sección de verificación de teléfono (send OTP / verify OTP)

---

### FASE 3 — Módulo de Cotizaciones (Core del Sistema)

**Objetivo:** Implementar el módulo principal de cotizaciones con todo su flujo.

#### 3.1 Lista de cotizaciones (`/dashboard/quotations`)

- **DataTable** con columnas:
  - Folio (quotationNumber)
  - Cliente (clientName)
  - Fecha
  - Status (badge con color por estado)
  - Total (formateado con moneda)
  - Acciones
- **Filtros avanzados** (panel colapsable o sidebar de filtros):
  - Status (multi-select o tabs)
  - Rango de fechas (date picker range)
  - Búsqueda por folio o cliente
- **Paginación** server-side
- **Botón "Nueva cotización"** prominente
- **Acciones por fila:**
  - Ver detalle
  - Editar (solo DRAFT)
  - Duplicar
  - Descargar PDF
  - Cambiar status
  - Eliminar

**Colores de status para los badges:**
```
DRAFT     → gris/slate
SENT      → azul
ACCEPTED  → verde
REJECTED  → rojo
EXPIRED   → amarillo/amber
CANCELLED → gris oscuro
```

#### 3.2 Crear cotización (`/dashboard/quotations/new`)

Formulario multi-paso o formulario largo con secciones colapsables:

**Sección 1: Datos del Cliente**
- clientName (requerido)
- clientContact
- clientEmail
- clientPhone
- clientAddress

**Sección 2: Condiciones Comerciales**
- currency (select: USD, MXN)
- paymentMethod
- paymentTerms (textarea)
- deliveryTime
- deliveryTerms (textarea)
- warrantyTerms (textarea)

**Sección 3: Ítems de la Cotización**
- Tabla editable inline:
  - Botón "Agregar ítem"
  - Cada fila: productName, description, quantity, unitPrice, discount
  - Subtotal calculado automáticamente en frontend (para preview inmediato)
  - Botón para seleccionar producto del catálogo (abre un modal con buscador de productos, al seleccionar llena productName, unitPrice y productId)
  - Drag & drop para reordenar (o botones up/down)
  - Botón eliminar por fila
- Resumen de totales abajo de la tabla:
  - Subtotal
  - Descuento global (editable)
  - IVA/Tax rate (editable, ej: 16%)
  - Tax amount (calculado)
  - **Total** (resaltado)

**Sección 4: Configuración Adicional**
- date (date picker, default: hoy)
- expirationDate (date picker, opcional)
- taxRate (input numérico)
- discount (input numérico)
- notes (textarea)
- internalNotes (textarea, con nota "No se incluye en el PDF")
- templateId (select de plantillas disponibles)

**Al guardar:** POST `/api/quotations` con todo, incluyendo items inline → redirect a vista de detalle.

#### 3.3 Ver detalle de cotización (`/dashboard/quotations/[id]`)

Vista completa de la cotización con toda la información:

- **Header**: folio, status badge, fecha, botones de acción
- **Acciones según status:**
  - DRAFT: Editar, Enviar (→ SENT), Cancelar, Duplicar, Descargar PDF, Preview PDF
  - SENT: Marcar aceptada (→ ACCEPTED), Marcar rechazada (→ REJECTED), Cancelar, Duplicar, Descargar PDF
  - ACCEPTED/REJECTED/EXPIRED/CANCELLED: Solo Duplicar y Descargar PDF
- **Información del cliente**: card con datos
- **Condiciones comerciales**: card con datos
- **Tabla de ítems**: tabla formateada con totales
- **Tabla de amortización** (si existe): tabla con mensualidades
- **Notas**: notas generales + notas internas (marcada como "Solo interno")
- **Botón "Descargar PDF"**: descarga el archivo
- **Botón "Preview PDF"**: abre modal con iframe que muestra el PDF
- **Información de auditoría**: creado por, fecha de creación, última actualización

#### 3.4 Editar cotización (`/dashboard/quotations/[id]/edit`)

Mismo formulario que crear, pero pre-llenado con datos existentes.
- Solo accesible si status = DRAFT
- Los ítems se gestionan individualmente (agregar, editar, eliminar, reordenar) usando los endpoints de ítems
- Al guardar: PATCH `/api/quotations/:id`

#### 3.5 Flujo de cambio de status

Usar un dropdown o modal de confirmación:
```
"¿Enviar cotización al cliente?" → PATCH /status { status: "SENT" }
"¿Marcar como aceptada?"         → PATCH /status { status: "ACCEPTED" }
"¿Marcar como rechazada?"        → PATCH /status { status: "REJECTED" }
"¿Cancelar cotización?"          → PATCH /status { status: "CANCELLED" }
```

Después de cambiar status, refrescar los datos y actualizar la UI.

#### 3.6 Duplicar cotización

Al hacer clic en "Duplicar":
1. POST `/api/quotations/:id/duplicate`
2. Mostrar toast de éxito
3. Redirect a la nueva cotización (detalle o edición)

#### 3.7 Descarga y Preview de PDF

**Descarga:**
```typescript
const response = await axios.get(`/quotations/${id}/pdf`, {
  responseType: 'blob',
  headers: { Authorization: `Bearer ${token}` }
});
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = `cotizacion-${quotationNumber}.pdf`;
link.click();
```

**Preview en modal:**
```typescript
const response = await axios.post(`/quotations/${id}/pdf/preview`, {}, {
  responseType: 'blob',
  headers: { Authorization: `Bearer ${token}` }
});
const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
// Mostrar en <iframe src={url} /> dentro de un modal fullscreen
```

---

### FASE 4 — Tabla de Amortización y Configuración del Tenant

**Objetivo:** Implementar gestión de pagos y configuración empresarial.

#### 4.1 Tabla de amortización (dentro del detalle/edición de cotización)

**Sección en la vista de detalle** que muestra:
- Si no hay schedule: botón "Generar tabla de amortización"
- Si hay schedule: tabla con columnas (No., Fecha, Concepto, Monto) + botones "Regenerar" y "Eliminar"

**Modal "Generar amortización":**
```
Formulario:
- Total (pre-llenado con el total de la cotización, editable)
- Anticipo (opcional)
- Número de mensualidades
- Fecha de inicio (date picker)

→ POST /payment-schedule/generate
→ Muestra preview de la tabla generada
```

**Edición manual:** También permitir reemplazar el schedule completo (PUT) enviando un array.

#### 4.2 Configuración del tenant (`/dashboard/settings/company`)

Formulario con tabs/secciones:

**Tab 1: Branding**
- Subir logo (drag & drop o file input → POST /quotation-config/logo)
- Preview del logo actual
- Color primario (color picker)
- Color secundario (color picker)

**Tab 2: Folio**
- Prefijo de cotización (ej: "JR", "COT")
- Formato del folio (mostrar ejemplo en vivo)
- Siguiente número secuencial

**Tab 3: Secciones del PDF**
- Toggles para cada sección:
  - Mostrar portada
  - Mostrar términos y condiciones
  - Mostrar datos bancarios
  - Mostrar tabla de amortización
  - Mostrar contraportada

**Tab 4: Datos Fiscales**
- Razón social
- RFC
- Dirección fiscal

**Tab 5: Datos Bancarios**
- Lista de cuentas bancarias (array dinámico):
  - Moneda (MXN/USD)
  - Banco
  - Titular
  - Número de cuenta
  - CLABE
  - Sucursal
  - SWIFT
- Botón "Agregar cuenta" / "Eliminar cuenta"

**Tab 6: Sucursales**
- Lista dinámica de sucursales:
  - Nombre
  - Dirección
  - Teléfono
  - Tipo (showroom, oficina, bodega)
- Botón "Agregar sucursal" / "Eliminar sucursal"

**Tab 7: Términos y Condiciones**
- Textarea grande para los T&C (texto plano)
- Nota: "Este texto aparecerá en la página de Términos y Condiciones del PDF"

**Tab 8: Firma**
- Nombre del firmante por defecto
- Cargo del firmante
- Website

**Guardar:** PUT `/api/quotation-config` con todos los datos.

#### 4.3 Plantillas de cotización (`/dashboard/settings/templates`)

- **Lista** de plantillas del tenant
- **Crear/Editar plantilla**: formulario con:
  - Nombre
  - Descripción
  - Es default (checkbox)
  - Secciones: lista ordenable de secciones con toggle enable/disable
    - Cada sección muestra: tipo (cover, detail, terms, etc.), orden (drag), habilitada (toggle)

---

### FASE 5 — Pulido, UX y Detalles Finales

**Objetivo:** Polish completo de la aplicación.

#### 5.1 Componentes reutilizables
- `DataTable` genérico con paginación server-side, sorting, búsqueda
- `ConfirmDialog` para acciones destructivas
- `StatusBadge` para mostrar status con colores
- `CurrencyDisplay` para formatear montos (ej: $89,900.00 USD)
- `EmptyState` para listas vacías
- `LoadingSkeleton` para estados de carga
- `PageHeader` con título, breadcrumbs, y acciones

#### 5.2 Formateo de moneda
```typescript
// Todas las cantidades monetarias deben mostrarse formateadas:
// USD: $89,900.00 USD
// MXN: $1,609,200.00 MXN
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount) + ` ${currency}`;
}
```

#### 5.3 Manejo de errores global
- Interceptor de Axios que muestra toasts para errores de red, 400, 403, 500
- Páginas de error personalizadas (404, 500)
- Loading states en todas las acciones async

#### 5.4 Responsive design
- El sidebar debe colapsarse en mobile (hamburger menu)
- Las tablas deben ser scrollables horizontalmente en mobile
- Los formularios deben adaptarse a mobile (stack vertical)

#### 5.5 Dark mode
- Soporte completo con `next-themes`
- Toggle en el header
- Todos los componentes deben verse bien en ambos temas

#### 5.6 Protección de rutas por rol
- Las rutas de admin (`/dashboard/admin/*`) solo deben ser accesibles para usuarios con rol `admin`
- Mostrar/ocultar elementos del sidebar según permisos del rol
- Si un usuario sin permiso intenta acceder, redirigir al dashboard con un toast de error

---

## Reglas y Convenciones para el Frontend

1. **Siempre usa TypeScript estricto** — no uses `any` excepto donde sea inevitable
2. **Componentes de servidor vs cliente**: usa Server Components donde sea posible, Client Components (`'use client'`) solo para interactividad
3. **Validación dual**: Zod en frontend (mismo esquema que los DTOs del backend) + los errores del backend se muestran como fallback
4. **Todas las peticiones al API pasan por la capa de servicio** (`lib/api/`), nunca llamar Axios directamente desde componentes
5. **React Query para todo el data fetching**: queries para GETs, mutations para POST/PATCH/DELETE, invalidación de cache después de mutaciones
6. **Optimistic updates** para acciones simples como cambiar status o eliminar
7. **Formularios con React Hook Form + Zod resolver** en todos los formularios
8. **Toasts para feedback**: éxito en acciones, errores de validación, errores de red
9. **El backend no devuelve items en el listado de cotizaciones** — solo en el detalle (GET /:id). Tener esto en cuenta para evitar requests innecesarios
10. **Los totales se recalculan en el backend** al agregar/editar/eliminar ítems, pero mostrar un preview calculado en frontend para UX inmediata
11. **El tenantId nunca se envía en el body de cotizaciones** — el backend lo toma del usuario autenticado
12. **Los decimales vienen como string del backend** (TypeORM/PostgreSQL) — parsear con `parseFloat()` o `Number()` al usarlos
13. **Las fechas vienen como string ISO** — parsear con `new Date()` y formatear con `Intl.DateTimeFormat` o una librería como `date-fns`
14. **Soft deletes**: la UI no necesita saber de `isDeleted`, el backend ya filtra los registros eliminados
