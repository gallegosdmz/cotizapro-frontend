import { z } from 'zod';

/**
 * Mexican phone: optional +52 / 52 country prefix, then 10 digits starting 1-9.
 * Matches the backend IsPhoneNumber('MX') regex declared in the DTOs.
 */
const MX_PHONE_REGEX = /^(\+52|52)?[1-9][0-9]{9}$/;

const phoneField = z
  .string()
  .regex(MX_PHONE_REGEX, 'Formato invalido. Usa +52XXXXXXXXXX o 10 digitos')
  .optional()
  .or(z.literal(''));

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const uuidField = z.string().regex(UUID_REGEX, 'ID invalido');

/**
 * Self-service profile update — never include tenantId or roleId here.
 * The backend will reject PATCH /users/me with 400 if they are present.
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email invalido'),
  phone: phoneField,
});
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Admin creates a new client user. `tenantId` is required because the whole
 * point of this form is assigning the client to a tenant.
 */
export const createClientSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  phone: phoneField,
  tenantId: uuidField,
  roleId: uuidField.optional(),
});
export type CreateClientFormData = z.infer<typeof createClientSchema>;

/**
 * Admin edits an existing user. tenantId can be '' (unassign) or a UUID.
 * The page transforms '' → null before sending.
 */
export const adminUpdateUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email invalido'),
  phone: phoneField,
  tenantId: z.string().refine(
    (v) => v === '' || UUID_REGEX.test(v),
    'ID de tenant invalido',
  ),
  roleId: uuidField.optional(),
});
export type AdminUpdateUserFormData = z.infer<typeof adminUpdateUserSchema>;
