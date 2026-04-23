export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateTenantRequest {
  name: string;
}

export interface UpdateTenantRequest {
  name?: string;
}
