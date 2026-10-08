import type { DocumentRequirement, FieldCondition } from "@/types/builder";

const identifier = (
  label: string,
  placeholder: string,
  helperText: string,
) => ({ label, placeholder, helperText });

const IDENTIFIER_CONFIGS: Record<string, DocumentRequirement["identifierConfig"]> = {
  "certificate-of-incorporation": identifier(
    "Company Registration Number",
    "e.g. U72200KA2018PTC112345",
    "Enter the registration or incorporation number printed on the certificate.",
  ),
  "tax-registration-certificate": identifier(
    "GSTIN / Tax Registration Number",
    "e.g. 29ABCDE1234F1Z5",
    "Enter the authoritative tax registration number shown on the certificate.",
  ),
  "pan-tax-identity": identifier(
    "PAN / Tax Identity Number",
    "e.g. ABCDE1234F",
    "Enter the permanent tax identity number printed on the document.",
  ),
  "cancelled-cheque-bank-statement": identifier(
    "Bank Account Number",
    "e.g. 98765432100012",
    "Enter the account number printed on the bank document.",
  ),
  "iso-27001": identifier(
    "Certificate Number",
    "e.g. ISO-27001-2026-1001",
    "Enter the certificate number issued by the certification body.",
  ),
  "cyber-liability-insurance": identifier(
    "Policy Number",
    "e.g. CYBER-POL-2026-1001",
    "Enter the policy number printed on the insurance certificate.",
  ),
  "contractor-class-license": identifier(
    "License Number",
    "e.g. PWD-CLASS-I-2026-1001",
    "Enter the contractor license number issued by the authority.",
  ),
  "iso-45001": identifier(
    "Certificate Number",
    "e.g. ISO-45001-2026-1001",
    "Enter the certificate number issued by the certification body.",
  ),
  "contractors-all-risk": identifier(
    "Policy Number",
    "e.g. CAR-POL-2026-1001",
    "Enter the policy number printed on the insurance certificate.",
  ),
  "iso-9001": identifier(
    "Certificate Number",
    "e.g. ISO-9001-2026-1001",
    "Enter the certificate number issued by the certification body.",
  ),
  "iso-14001": identifier(
    "Certificate Number",
    "e.g. ISO-14001-2026-1001",
    "Enter the certificate number issued by the certification body.",
  ),
  "factory-license": identifier(
    "Factory License Number",
    "e.g. FACTORY-KA-2026-1001",
    "Enter the operating license number issued by the authority.",
  ),
  "pollution-control-consent": identifier(
    "Consent Order Number",
    "e.g. CTO-KA-2026-1001",
    "Enter the consent or authorization number printed on the document.",
  ),
  "fssai-fda-clearance": identifier(
    "License / Clearance Number",
    "e.g. FSSAI-1001-2026",
    "Enter the food or pharmaceutical license number printed on the document.",
  ),
  "gmp-certificate": identifier(
    "Certificate Number",
    "e.g. GMP-2026-1001",
    "Enter the GMP certificate number issued by the authority.",
  ),
  "git-cargo-insurance": identifier(
    "Policy Number",
    "e.g. GIT-POL-2026-1001",
    "Enter the goods-in-transit policy number printed on the document.",
  ),
  "transporter-permit": identifier(
    "Permit / License Number",
    "e.g. MTO-MH-2026-1001",
    "Enter the transporter permit or goods-carriage license number.",
  ),
  "commercial-fleet-fitness": identifier(
    "Certificate / Policy Number",
    "e.g. FLEET-2026-1001",
    "Enter the fleet fitness or insurance identifier printed on the document.",
  ),
  "hazmat-cold-chain-clearance": identifier(
    "Clearance / Calibration Number",
    "e.g. PESO-2026-1001",
    "Enter the clearance or calibration certificate number.",
  ),
};

export const DOCUMENT_CATEGORIES = [
  { id: "IT", label: "IT & Software Services" },
  { id: "Civil", label: "Civil & Infrastructure" },
  { id: "Manufacturing", label: "Manufacturing & Heavy Engineering" },
  { id: "Healthcare", label: "Healthcare, Pharma & Food" },
  { id: "Logistics", label: "Logistics & Transport" },
] as const;

export function normalizeDocumentCategory(category?: string): string {
  const normalized = (category || "").trim().toLowerCase();
  if (normalized === "it" || normalized.includes("it & software")) return "it";
  if (normalized === "civil" || normalized.includes("civil &")) return "civil";
  if (normalized === "manufacturing" || normalized.includes("manufacturing &")) return "manufacturing";
  if (
    normalized === "healthcare" ||
    (normalized.includes("healthcare") &&
      (normalized.includes("food") || normalized.includes("pharma")))
  ) {
    return "healthcare";
  }
  if (normalized === "logistics" || normalized.includes("logistics &")) return "logistics";
  return normalized;
}

const common = (
  id: string,
  name: string,
  required: boolean,
  description: string,
): DocumentRequirement => ({
  id,
  name,
  scope: "COMMON",
  categoryTrigger: "ALL",
  required,
  description,
  validityType: "LIFETIME",
  isLifetime: true,
  locked: true,
  maxSizeMb: 10,
  acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
  identifierConfig: IDENTIFIER_CONFIGS[id],
});

const category = (
  id: string,
  name: string,
  categoryTrigger: string,
  validityPeriod: string,
  description: string,
  conditional?: FieldCondition,
): DocumentRequirement => ({
  id,
  name,
  scope: "CATEGORY",
  categoryTrigger,
  required: true,
  description,
  validityType: "TIME_BOUND",
  validityPeriod,
  expiryWarningDays: 30,
  isLifetime: false,
  maxSizeMb: 10,
  acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
  identifierConfig: IDENTIFIER_CONFIGS[id],
  conditional,
});

export const COMMON_DOCUMENTS: DocumentRequirement[] = [
  common(
    "certificate-of-incorporation",
    "Certificate of Incorporation (COI)",
    true,
    "Official company incorporation certificate.",
  ),
  common(
    "tax-registration-certificate",
    "Tax Registration Certificate",
    true,
    "GST Certificate, TIN, or VAT registration.",
  ),
  common(
    "pan-tax-identity",
    "PAN Card / Tax Identity",
    true,
    "Company PAN or equivalent tax identity document.",
  ),
  common(
    "cancelled-cheque-bank-statement",
    "Cancelled Cheque / Bank Statement",
    true,
    "Document showing the legal account holder and bank details.",
  ),
  common(
    "msme-udyam-certificate",
    "MSME / Udyam Certificate",
    false,
    "Optional MSME or Udyam registration certificate.",
  ),
];

export const CATEGORY_DOCUMENTS: DocumentRequirement[] = [
  category(
    "iso-27001",
    "ISO 27001 Information Security Certification",
    "IT",
    "3 years",
    "Information security certification.",
  ),
  category(
    "cyber-liability-insurance",
    "Cyber Liability / Errors & Omissions Insurance",
    "IT",
    "Annual",
    "Technology liability insurance.",
  ),
  category(
    "contractor-class-license",
    "Contractor Class License (PWD/CPWD)",
    "Civil",
    "3–5 years",
    "Valid contractor classification license.",
  ),
  category(
    "iso-45001",
    "ISO 45001 Health & Safety",
    "Civil",
    "3 years",
    "Occupational health and safety certification.",
  ),
  category(
    "contractors-all-risk",
    "Contractors All Risk (CAR) Insurance",
    "Civil",
    "Project/Annual",
    "Contractor risk insurance.",
  ),
  category(
    "iso-9001",
    "ISO 9001 Quality",
    "Manufacturing",
    "3 years",
    "Quality management certification.",
  ),
  category(
    "iso-14001",
    "ISO 14001 Environment",
    "Manufacturing",
    "3 years",
    "Environmental management certification.",
  ),
  category(
    "factory-license",
    "Factory License",
    "Manufacturing",
    "1–5 years",
    "Current factory operating license.",
  ),
  category(
    "pollution-control-consent",
    "Pollution Control Board Consent to Operate (CTO)",
    "Manufacturing",
    "1–5 years",
    "Current pollution control consent.",
  ),
  category(
    "fssai-fda-clearance",
    "FSSAI License / FDA Clearance",
    "Healthcare",
    "1–5 years",
    "Food or pharmaceutical regulatory clearance.",
  ),
  category(
    "gmp-certificate",
    "GMP Certificate",
    "Healthcare",
    "2–3 years",
    "Good manufacturing practices certificate.",
  ),
  category(
    "git-cargo-insurance",
    "Goods in Transit (GIT) Cargo Insurance",
    "Logistics",
    "Annual",
    "Goods in transit insurance.",
  ),
  category(
    "transporter-permit",
    "Transporter Permit / Goods Carriage / MTO License",
    "Logistics",
    "5 years",
    "Transport operating permit or license.",
  ),
  category(
    "commercial-fleet-fitness",
    "Commercial Fleet Fitness & Insurance",
    "Logistics",
    "1–2 years",
    "Fleet fitness and insurance evidence.",
  ),
  category(
    "hazmat-cold-chain-clearance",
    "HAZMAT (PESO) Clearance or Cold Chain Calibration",
    "Logistics",
    "Time-bound",
    "Conditional logistics compliance document.",
    {
      fieldId: "handlesHazmatOrColdChain",
      operator: "EQUALS",
      value: true,
    },
  ),
];

export function getCommonDocuments(): DocumentRequirement[] {
  return COMMON_DOCUMENTS.map((document) => ({ ...document }));
}

export function getCategoryDocuments(
  categoryId: string,
): DocumentRequirement[] {
  return CATEGORY_DOCUMENTS.filter(
    (document) =>
      normalizeDocumentCategory(document.categoryTrigger) ===
      normalizeDocumentCategory(categoryId),
  ).map((document) => ({ ...document }));
}

export function getApplicableDocuments(
  supplierCategory: string,
  registration?: Pick<
    RegistrationDocumentConfig,
    "documentOverrides" | "customCategoryDocuments"
  >,
): DocumentRequirement[] {
  const overrides = registration?.documentOverrides ?? {};
  const categoryDocuments = [
    ...getCategoryDocuments(supplierCategory),
    ...(registration?.customCategoryDocuments ?? []).filter(
      (document) =>
        normalizeDocumentCategory(document.categoryTrigger) ===
        normalizeDocumentCategory(supplierCategory),
    ),
  ];
  return [
    ...getCommonDocuments(),
    ...categoryDocuments
      .map((document) => {
        const override = overrides[document.id];
        if (override?.enabled === false) return null;
        return {
          ...document,
          ...(override?.required === undefined
            ? {}
            : { required: override.required }),
        };
      })
      .filter((document): document is DocumentRequirement => Boolean(document)),
  ];
}

export function cleanupObsoleteDocuments<T extends { docId: string }>(
  uploadedDocuments: T[],
  supplierCategory: string,
  registration?: Pick<
    RegistrationDocumentConfig,
    "documentOverrides" | "customCategoryDocuments"
  >,
): T[] {
  const applicableIds = new Set(
    getApplicableDocuments(supplierCategory, registration).map(
      (document) => document.id,
    ),
  );
  return uploadedDocuments.filter((document) =>
    applicableIds.has(document.docId),
  );
}

interface RegistrationDocumentConfig {
  documentOverrides?: Record<string, { enabled: boolean; required?: boolean }>;
  customCategoryDocuments?: DocumentRequirement[];
}
