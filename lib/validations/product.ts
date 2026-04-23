import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  stock: z.coerce.number().int('Debe ser entero').min(0, 'Minimo 0'),
  unitPrice: z.coerce.number().min(0, 'Minimo 0'),
  tenantId: z.string().uuid('Tenant invalido'),
  exchangeRate: z.string().optional(),
  imagePath: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
