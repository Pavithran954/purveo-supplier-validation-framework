export type RegistrationType = 'HYBRID' | 'CLOSED' | 'OPEN';
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';
export type Operator = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IS_NOT_EMPTY';

export interface FieldCondition {
  fieldId: string;
  operator: Operator;
  value: any;
}

export interface DynamicField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required: boolean;
  visibilityRule?: {
    matchType: 'ALL' | 'ANY';
    conditions: FieldCondition[];
  };
}

export interface DocumentRequirement {
  id: string;
  name: string;
  categoryTrigger: string; // 'ALL' | 'IT' | 'Civil' | 'Manufacturing'
  required: boolean;
  description?: string;
  maxSizeMb?: number;
  acceptedFileTypes?: string[];
  requiresExpiryDate?: boolean;
  isLifetime?: boolean;
  countryScope?: string;
  scope?: "COMMON" | "CATEGORY";
  validityType?: "LIFETIME" | "TIME_BOUND";
  validityPeriod?: string;
  expiryWarningDays?: number;
  validationWeight?: number;
  locked?: boolean;
  conditional?: FieldCondition;
  identifierConfig?: {
    label: string;
    placeholder: string;
    helperText: string;
  };
}

export interface BasicFieldConfig {
  companyName: boolean;
  contactPerson: boolean;
  email: boolean;
  country: boolean;
  category: boolean;
  annualTurnover: boolean;
  // Extended fields from the 8-page assignment specification:
  address?: boolean;
  phone?: boolean;
  productsServices?: boolean;
  companySize?: boolean;
  bankDetails?: boolean;
  taxDetails?: boolean;
  expectedPurchaseValue?: boolean;
  supplyingItem?: boolean;
}

export interface RegistrationTemplate {
  id: string;
  title: string;
  type: RegistrationType;
  validity: {
    startDate: string;
    endDate: string;
  };
  invitedEmails?: string[];
  basicFields: BasicFieldConfig;
  customFields: DynamicField[];
  documents: DocumentRequirement[];
  createdAt: string;
  description?: string;
  documentOverrides?: Record<string, { enabled: boolean; required?: boolean }>;
  customCategoryDocuments?: DocumentRequirement[];
}

export interface HybridRequest {
  id: string;
  templateId: string;
  companyName: string;
  email: string;
  category: string;
  aboutUs: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
}

export interface DocumentUploadItem {
  docId: string;
  fileName: string;
  fileSize?: number; // in bytes
  fileType?: string; // MIME type
  fileDataUrl?: string; // simulated or actual data preview
  uploadedAt?: string;
  expiryDate?: string; // user provided or OCR extracted
  isLifetime?: boolean; // Lifetime validity documents do not expire
  // Simulated OCR & metadata extraction
  extractedEntityName?: string;
  extractedDocNumber?: string;
  ocrConfidence?: number;
  // Validation flags
  isExpired?: boolean;
  isExpiringSoon?: boolean; // within 30 days
  nameMatchStatus?: 'MATCH' | 'MISMATCH' | 'NOT_APPLICABLE';
  validationErrors?: string[];
  validationWarnings?: string[];
}

export interface ValidationCheckItem {
  id: string;
  category: 'COMPANY_INFO' | 'GST' | 'PAN' | 'BANK_DETAILS' | 'DOCUMENTS' | 'NAME_MATCHING' | 'BUSINESS_RULES';
  name: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message: string;
  details?: string;
  sourceValue?: any;
  targetValue?: any;
}

export interface ExternalRegistryVerification {
  gstin: string;
  legalName: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  taxpayerType: string;
  registrationDate: string;
  stateJurisdiction: string;
  mcaStatus: 'ACTIVE' | 'UNDER_LIQUIDATION' | 'INACTIVE';
  bankAccountValid: boolean;
  bankAccountHolderMatch: boolean;
}

export interface ValidationReport {
  score: number;
  status: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
  checks: ValidationCheckItem[];
  passedCount: number;
  failedCount: number;
  warningCount: number;
  totalChecks: number;
  summaryTable: {
    companyInfo: 'Passed' | 'Failed';
    gst: 'Verified' | 'Invalid' | 'Not Provided';
    pan: 'Verified' | 'Invalid' | 'Not Provided';
    bankDetails: 'Verified' | 'Mismatch' | 'Not Provided';
    documents: 'All valid' | 'One document expiring' | 'Document expired' | 'Missing required';
    companyNameMatching: 'Passed' | 'Mismatch / Review Required';
  };
  externalRegistry?: ExternalRegistryVerification;
}

export interface SupplierSubmission {
  id: string;
  templateId: string;
  data: Record<string, any>;
  documentsUploaded: DocumentUploadItem[];
  submittedAt: string;
  validationScore?: number;
  validationStatus?: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
  validationReport?: ValidationReport;
  adminReviewNotes?: string;
  adminOverrideStatus?: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
}

export interface BusinessRuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'COMPLIANCE' | 'FINANCIAL' | 'DOCUMENT' | 'IDENTITY';
  conditionSummary: string;
  actionSummary: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  enabled: boolean;
}
