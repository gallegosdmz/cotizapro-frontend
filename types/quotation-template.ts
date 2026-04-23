export interface TemplateSection {
  type: 'cover' | 'detail' | 'terms' | 'bank_details' | 'payment_schedule' | 'back_page';
  order: number;
  enabled: boolean;
}

export interface QuotationTemplate {
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

export interface CreateQuotationTemplateRequest {
  name: string;
  description?: string;
  isDefault?: boolean;
  sections: TemplateSection[];
}

export interface UpdateQuotationTemplateRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
  sections?: TemplateSection[];
}
