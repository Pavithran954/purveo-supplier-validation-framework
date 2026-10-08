import type { ConfiguredSupplierField, SupplierField } from "@/src/types";

export const SUPPLIER_FIELDS: SupplierField[] = [
  { id: "company-name", key: "companyName", label: "Company name", type: "text", required: true },
  { id: "address", key: "address", label: "Business address", type: "textarea", required: true },
  { id: "contact-email", key: "contactEmail", label: "Contact email", type: "email", required: true },
  { id: "country", key: "country", label: "Country", type: "select", required: true, options: [{ label: "India", value: "IN" }, { label: "United States", value: "US" }] },
  { id: "supplier-category", key: "supplierCategory", label: "Supplier category", type: "select", required: true },
  { id: "annual-turnover", key: "annualTurnover", label: "Annual turnover", type: "currency", required: false },
  { id: "bank-details", key: "bankDetails", label: "Bank details", type: "text", required: false },
];

export const STANDARD_FIELD_DEFINITIONS: ConfiguredSupplierField[] = [
  { id: "company-name", key: "companyName", label: "Company name", type: "text", required: true, enabled: true },
  { id: "contact-person", key: "contactPerson", label: "Contact person", type: "text", required: false, enabled: false },
  { id: "contact-email", key: "contactEmail", label: "Email", type: "email", required: true, enabled: true },
  { id: "phone", key: "phone", label: "Phone", type: "phone", required: false, enabled: false },
  { id: "address", key: "address", label: "Address", type: "textarea", required: true, enabled: true },
  { id: "country", key: "country", label: "Country", type: "select", required: true, enabled: true, options: [{ label: "India", value: "IN" }, { label: "United States", value: "US" }, { label: "Singapore", value: "SG" }] },
  { id: "state", key: "state", label: "State / province", type: "text", required: false, enabled: false },
  { id: "city", key: "city", label: "City", type: "text", required: false, enabled: false },
  { id: "supplier-category", key: "supplierCategory", label: "Supplier category", type: "select", required: true, enabled: true, options: [{ label: "IT", value: "IT" }, { label: "Civil", value: "Civil" }, { label: "Manufacturing", value: "Manufacturing" }] },
  { id: "products-services", key: "productsServices", label: "Products / services", type: "textarea", required: false, enabled: false },
  { id: "company-size", key: "companySize", label: "Company size", type: "select", required: false, enabled: false, options: [{ label: "Small", value: "small" }, { label: "Medium", value: "medium" }, { label: "Large", value: "large" }] },
  { id: "annual-turnover", key: "annualTurnover", label: "Annual turnover", type: "currency", required: false, enabled: false },
  { id: "expected-purchase-value", key: "expectedPurchaseValue", label: "Expected purchase value", type: "currency", required: false, enabled: false },
  { id: "bank-details", key: "bankDetails", label: "Bank details", type: "text", required: false, enabled: false },
  { id: "tax-details", key: "taxDetails", label: "Tax / registration details", type: "textarea", required: false, enabled: false },
];
