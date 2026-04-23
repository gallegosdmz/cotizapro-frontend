export interface Product {
  id: string;
  name: string;
  description: string;
  stock: number;
  unitPrice: number;
  exchangeRate?: string;
  imagePath?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  stock: number;
  unitPrice: number;
  tenantId: string;
  exchangeRate?: string;
  imagePath?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  stock?: number;
  unitPrice?: number;
  exchangeRate?: string;
  imagePath?: string;
}
