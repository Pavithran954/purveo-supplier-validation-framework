export type ID = string;

export type RegistrationType = "open" | "closed" | "hybrid";
export type RegistrationStatus = "draft" | "active" | "closed" | "archived";
export type SupplierStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";
export type ValidationStatus = "passed" | "failed" | "warning" | "review_required" | "pending";
export type FinalValidationStatus = "approved" | "review_required" | "rejected";
export type RegistrationLifecycleStatus = "draft" | "published";
export type RegistrationAccessStatus = "not_found" | "not_started" | "active" | "expired" | "inactive";
export type PreScreeningStatus = "pending_screening" | "approved" | "rejected" | "onboarding_submitted";
export type SupplierSubmissionStatus = "draft" | "submitted" | "validation_pending" | "review_required";

export interface Registration {
  id: ID;
  name: string;
  description: string;
  type: RegistrationType;
  startDate: string;
  endDate: string | null;
  link: string;
  supplierCategory: string;
  status: RegistrationStatus;
  requiredFieldIds: string[];
  documentRequirementIds: string[];
  ruleIds: string[];
  createdAt: string;
  updatedAt: string;
  lifecycleStatus?: RegistrationLifecycleStatus;
  standardFields?: ConfiguredSupplierField[];
  customFields?: ConfiguredSupplierField[];
  documentRequirements?: DocumentRequirement[];
  rules?: ValidationRule[];
}

export type SupplierFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "boolean"
  | "currency"
  | "number"
  | "date";

export interface SupplierFieldOption {
  label: string;
  value: string;
}

export interface SupplierField {
  id: string;
  key: string;
  label: string;
  type: SupplierFieldType;
  required: boolean;
  helpText?: string;
  options?: SupplierFieldOption[];
}

export interface FieldCondition {
  fieldId: string;
  operator: RuleOperator;
  value: string | number | boolean;
}

export interface ConfiguredSupplierField extends SupplierField {
  enabled: boolean;
  conditions?: FieldCondition[];
}

export interface Supplier {
  id: ID;
  registrationId: ID;
  companyName: string;
  status: SupplierStatus;
  fieldValues: Record<string, string | number | boolean | null>;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequirement {
  id: ID;
  registrationId: ID;
  name: string;
  description: string;
  acceptedFileTypes: string[];
  maxSizeInMb: number;
  required: boolean;
  requiresExpiryDate: boolean;
  conditions?: FieldCondition[];
}

export interface SupplierDocument {
  id: ID;
  supplierId: ID;
  requirementId: ID;
  fileName: string;
  fileType: string;
  sizeInBytes: number;
  uploadedAt: string;
  expiryDate: string | null;
  status: "uploaded" | "valid" | "invalid" | "expired";
}

export interface ValidationCheck {
  id: ID;
  name: string;
  description: string;
  status: ValidationStatus;
  message?: string;
  checkedAt: string;
}

export interface ValidationResult {
  id: ID;
  supplierId: ID;
  checks: ValidationCheck[];
  score: number;
  finalStatus: FinalValidationStatus;
  completedAt: string | null;
}

export type RuleOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains";

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean;
}

export type RuleActionType = "require_document" | "set_status" | "create_warning";

export interface RuleAction {
  type: RuleActionType;
  value: string;
}

export interface ValidationRule {
  id: ID;
  registrationId: ID;
  name: string;
  description: string;
  condition: RuleCondition;
  action: RuleAction;
  enabled: boolean;
}

export interface PreScreeningSubmission {
  id: ID;
  registrationId: ID;
  companyName: string;
  email: string;
  category: string;
  aboutUs: string;
  status: PreScreeningStatus;
  createdAt: string;
  approvedAt: string | null;
  onboardingTokenId: string | null;
}

export interface OnboardingToken {
  id: ID;
  registrationId: ID;
  preScreeningId: ID;
  token: string;
  status: "active" | "revoked" | "used";
  createdAt: string;
  expiresAt: string | null;
}

export interface SupplierSubmission {
  id: ID;
  registrationId: ID;
  supplierId: ID;
  mode: RegistrationType;
  status: SupplierSubmissionStatus;
  values: Record<string, string | number | boolean | null>;
  documents: SupplierDocument[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
}

export interface SupplierDraft {
  id: ID;
  registrationId: ID;
  supplierId: ID;
  values: Record<string, string | number | boolean | null>;
  documents: SupplierDocument[];
  currentStep: number;
  lastUpdatedAt: string;
}
