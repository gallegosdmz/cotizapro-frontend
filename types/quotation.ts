export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface Quotation {
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

export interface QuotationItem {
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

export interface PaymentSchedule {
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

export interface CreateQuotationRequest {
  date?: string;
  expirationDate?: string;
  currency?: string;
  taxRate?: number;
  discount?: number;
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
  templateId?: string;
  items?: CreateQuotationItemRequest[];
}

export interface UpdateQuotationRequest {
  date?: string;
  expirationDate?: string;
  currency?: string;
  taxRate?: number;
  discount?: number;
  notes?: string;
  internalNotes?: string;
  clientName?: string;
  clientAddress?: string;
  clientContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  deliveryTime?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  templateId?: string;
}

export interface CreateQuotationItemRequest {
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  productId?: string;
}

export interface UpdateQuotationItemRequest {
  productName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  productId?: string;
}

export interface GeneratePaymentScheduleRequest {
  totalAmount?: number;
  downPayment?: number;
  numberOfInstallments: number;
  startDate: string;
}

export interface PaymentScheduleItemRequest {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  label?: string;
}

export interface ChangeStatusRequest {
  status: QuotationStatus;
}
