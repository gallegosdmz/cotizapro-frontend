import { Role } from './role';
import { Tenant } from './tenant';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
  roleId: string;
  role: Role;
  tenantId?: string | null;
  tenant?: Tenant | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

/**
 * Payload for self-service PATCH /users/me.
 * Backend rejects tenantId / roleId here (400 "Only admins can change tenant or role").
 */
export interface UpdateSelfRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}

/**
 * Payload for admin POST /users — creates a new client user attached to a tenant.
 */
export interface CreateClientRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantId: string;
  roleId?: string;
}

/**
 * Payload for admin PATCH /users/:id — tenantId can be null to unassign.
 */
export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  tenantId?: string | null;
  roleId?: string;
}
