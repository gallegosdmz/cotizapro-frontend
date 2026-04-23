export interface BankAccount {
  currency: string;
  bankName: string;
  accountHolder?: string;
  accountNumber?: string;
  clabe?: string;
  branch?: string;
  swift?: string;
}

export interface Branch {
  name: string;
  address: string;
  phone?: string;
  type?: string;
}

export interface TenantQuotationConfig {
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

export interface UpdateQuotationConfigRequest {
  primaryColor?: string;
  secondaryColor?: string;
  quotationPrefix?: string;
  nextSequentialNumber?: number;
  folioFormat?: string;
  showCoverPage?: boolean;
  showTermsAndConditions?: boolean;
  showBankDetails?: boolean;
  showPaymentSchedule?: boolean;
  showBackPage?: boolean;
  termsAndConditions?: string;
  bankAccounts?: BankAccount[];
  taxId?: string;
  legalName?: string;
  fiscalAddress?: string;
  branches?: Branch[];
  website?: string;
  defaultSignerName?: string;
  defaultSignerTitle?: string;
}
