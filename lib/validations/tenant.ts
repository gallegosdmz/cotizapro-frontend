import { z } from 'zod';

export const tenantSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
});

export type TenantFormData = z.infer<typeof tenantSchema>;
