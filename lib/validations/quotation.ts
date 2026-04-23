import { z } from 'zod';

export const quotationItemSchema = z.object({
  productName: z.string().min(1, 'Nombre del producto requerido'),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(1, 'Minimo 1'),
  unitPrice: z.coerce.number().min(0, 'Minimo 0'),
  discount: z.coerce.number().min(0).optional(),
  productId: z.string().uuid().optional(),
});

export const quotationSchema = z.object({
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),
  clientContact: z.string().optional(),
  clientEmail: z.string().email('Email invalido').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  clientAddress: z.string().optional(),
  currency: z.string().default('USD'),
  date: z.string().optional(),
  expirationDate: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(1).optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTime: z.string().optional(),
  deliveryTerms: z.string().optional(),
  warrantyTerms: z.string().optional(),
  templateId: z.string().uuid().optional().or(z.literal('')),
  items: z.array(quotationItemSchema).optional(),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;
export type QuotationItemFormData = z.infer<typeof quotationItemSchema>;

export const generateScheduleSchema = z.object({
  totalAmount: z.coerce.number().min(0).optional(),
  downPayment: z.coerce.number().min(0).optional(),
  numberOfInstallments: z.coerce.number().int().min(1, 'Minimo 1 mensualidad'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
});

export type GenerateScheduleFormData = z.infer<typeof generateScheduleSchema>;
