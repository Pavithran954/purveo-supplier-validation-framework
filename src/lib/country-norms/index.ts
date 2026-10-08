export interface CountryDocRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  isLifetime: boolean;
  categoryTrigger?: string;
  identifierConfig?: {
    label: string;
    placeholder: string;
    helperText: string;
  };
}

export interface CountryNorm {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  taxLabel: string;
  taxPlaceholder: string;
  taxRegex?: RegExp;
  taxHint: string;
  secondaryTaxLabel?: string;
  secondaryTaxPlaceholder?: string;
  secondaryTaxRegex?: RegExp;
  secondaryTaxHint?: string;
  secondaryTaxIsLifetime?: boolean;
  bankRoutingLabel: string;
  bankRoutingPlaceholder: string;
  bankRoutingRegex?: RegExp;
  bankRoutingHint: string;
  bankAccountLabel: string;
  bankAccountPlaceholder: string;
  registryAuthority: string;
  registryAuthorityShort: string;
  standardDocuments: CountryDocRequirement[];
}

export const COUNTRY_NORMS: Record<string, CountryNorm> = {
  India: {
    code: "IN",
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    taxLabel: "GSTIN (Goods & Services Tax Number)",
    taxPlaceholder: "e.g. 29ABCDE1234F1Z5",
    taxRegex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    taxHint: "15 characters: 2 state digits + 10 PAN characters + entity code + Z + checksum",
    secondaryTaxLabel: "Permanent Account Number (PAN)",
    secondaryTaxPlaceholder: "e.g. ABCDE1234F",
    secondaryTaxRegex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    secondaryTaxHint: "10 alphanumeric: 5 letters + 4 digits + 1 letter (Lifetime validity)",
    secondaryTaxIsLifetime: true,
    bankRoutingLabel: "Bank IFSC Code",
    bankRoutingPlaceholder: "e.g. HDFC0001234",
    bankRoutingRegex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    bankRoutingHint: "11 characters: 4 letters bank code + 0 + 6 alphanumeric branch code",
    bankAccountLabel: "Commercial Bank Account Number",
    bankAccountPlaceholder: "e.g. 98765432100012",
    registryAuthority: "Goods and Services Tax Network (GSTN) / MCA",
    registryAuthorityShort: "GSTN / MCA",
    standardDocuments: [
      {
        id: "doc_tax_cert",
        name: "GST Registration Certificate",
        description: "Official GST registration certificate (Form GST REG-06) issued by GSTN.",
        required: true,
        isLifetime: false,
      },
      {
        id: "doc_pan_card",
        name: "PAN Card / Tax ID Proof",
        description: "Permanent Account Number card. Valid for lifetime once issued.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_corp_reg",
        name: "Certificate of Incorporation / Business Registration Certificate",
        description: "Official ROC incorporation charter or MSME Udyam certificate. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_bank_proof",
        name: "Cancelled Cheque / Bank Statement",
        description: "Pre-printed bank cancelled cheque or official account statement displaying IFSC & account holder name.",
        required: true,
        isLifetime: false,
      },
    ],
  },

  "United States": {
    code: "US",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    taxLabel: "Federal Employer Identification Number (EIN / FEIN)",
    taxPlaceholder: "e.g. 12-3456789",
    taxRegex: /^\d{2}-?\d{7}$/,
    taxHint: "9 digits issued by IRS (XX-XXXXXXX)",
    secondaryTaxLabel: "State Secretary of State / Entity Charter ID",
    secondaryTaxPlaceholder: "e.g. C1234567 or SOS-89210",
    secondaryTaxHint: "State incorporation charter or corporate entity ID (Lifetime validity)",
    secondaryTaxIsLifetime: true,
    bankRoutingLabel: "ABA Routing Transit Number (ACH / Wire)",
    bankRoutingPlaceholder: "e.g. 021000021",
    bankRoutingRegex: /^\d{9}$/,
    bankRoutingHint: "9 numeric digits Fedwire / ACH routing number",
    bankAccountLabel: "Commercial Checking Account Number",
    bankAccountPlaceholder: "e.g. 123456789012",
    registryAuthority: "Internal Revenue Service (IRS) & State SOS",
    registryAuthorityShort: "IRS / SOS",
    standardDocuments: [
      {
        id: "doc_tax_cert",
        name: "IRS Form W-9 / Form SS-4 (EIN Confirmation)",
        description: "Signed IRS Form W-9 or official IRS SS-4 letter confirming Federal Tax ID. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_corp_reg",
        name: "Articles of Incorporation / Certificate of Formation",
        description: "Official State Secretary of State charter or Certificate of Formation. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_bank_proof",
        name: "Bank Account Verification Letter / Voided Check",
        description: "Official corporate bank letterhead statement or voided commercial check with ABA routing number.",
        required: true,
        isLifetime: false,
      },
    ],
  },

  "United Kingdom": {
    code: "UK",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    taxLabel: "UK VAT Registration Number",
    taxPlaceholder: "e.g. GB 123 4567 89",
    taxRegex: /^(GB)?\s?[0-9]{3}\s?[0-9]{4}\s?[0-9]{2}$/i,
    taxHint: "9 numeric digits with optional 'GB' prefix",
    secondaryTaxLabel: "Companies House Company Registration Number (CRN)",
    secondaryTaxPlaceholder: "e.g. 01234567 or SC123456",
    secondaryTaxHint: "8-character official registration number issued by Companies House (Lifetime validity)",
    secondaryTaxIsLifetime: true,
    bankRoutingLabel: "UK Bank Sort Code",
    bankRoutingPlaceholder: "e.g. 20-00-00",
    bankRoutingRegex: /^\d{2}-?\d{2}-?\d{2}$/,
    bankRoutingHint: "6 digits formatted XX-XX-XX",
    bankAccountLabel: "UK Bank Account Number (8 digits)",
    bankAccountPlaceholder: "e.g. 12345678",
    registryAuthority: "Companies House & HM Revenue and Customs (HMRC)",
    registryAuthorityShort: "Companies House / HMRC",
    standardDocuments: [
      {
        id: "doc_corp_reg",
        name: "Companies House Certificate of Incorporation",
        description: "Official Companies House certificate of incorporation. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_tax_cert",
        name: "HMRC VAT Certificate of Registration",
        description: "Official VAT registration certificate issued by HM Revenue & Customs.",
        required: true,
        isLifetime: false,
      },
      {
        id: "doc_bank_proof",
        name: "Corporate Bank Account Statement",
        description: "Recent business bank statement (within 3 months) showing sort code and account number.",
        required: true,
        isLifetime: false,
      },
    ],
  },

  Singapore: {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    currencySymbol: "S$",
    taxLabel: "ACRA Unique Entity Number (UEN)",
    taxPlaceholder: "e.g. 201812345A or T18LL1234B",
    taxRegex: /^[0-9]{8,9}[A-Z]$|^[TSR][0-9]{2}[A-Z]{2}[0-9]{4}[A-Z]$/i,
    taxHint: "Standard 9-10 character entity identifier issued by ACRA (Lifetime validity)",
    secondaryTaxLabel: "IRAS GST Registration Number (if applicable)",
    secondaryTaxPlaceholder: "e.g. M90312345X",
    secondaryTaxHint: "Goods and Services Tax number registered with IRAS",
    secondaryTaxIsLifetime: true,
    bankRoutingLabel: "Bank & Branch Code (FAST / GIRO Routing)",
    bankRoutingPlaceholder: "e.g. 7171-001 (DBS Bank)",
    bankRoutingHint: "Bank clearing code (e.g. 7171 for DBS, 7339 for OCBC, 7375 for UOB)",
    bankAccountLabel: "Corporate Bank Account Number",
    bankAccountPlaceholder: "e.g. 0039012345",
    registryAuthority: "Accounting and Corporate Regulatory Authority (ACRA)",
    registryAuthorityShort: "ACRA",
    standardDocuments: [
      {
        id: "doc_corp_reg",
        name: "ACRA Business Profile & Certificate of Registration",
        description: "Official ACRA Business Profile extracted from BizFile+. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_bank_proof",
        name: "Corporate Bank Account Statement",
        description: "Recent business bank account statement or electronic confirmation slip.",
        required: true,
        isLifetime: false,
      },
    ],
  },

  Germany: {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    currencySymbol: "€",
    taxLabel: "Umsatzsteuer-Identifikationsnummer (USt-IdNr / VAT ID)",
    taxPlaceholder: "e.g. DE123456789",
    taxRegex: /^DE\s?[0-9]{9}$/i,
    taxHint: "'DE' followed by 9 digits",
    secondaryTaxLabel: "Handelsregisternummer (HRB / HRA Commercial Register)",
    secondaryTaxPlaceholder: "e.g. HRB 123456 B",
    secondaryTaxHint: "Commercial register entry number (Amtsgericht). Valid for lifetime.",
    secondaryTaxIsLifetime: true,
    bankRoutingLabel: "Bank BIC / SWIFT Code",
    bankRoutingPlaceholder: "e.g. DEUTDEDDFXX",
    bankRoutingRegex: /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i,
    bankRoutingHint: "8 or 11 alphanumeric SWIFT/BIC routing code",
    bankAccountLabel: "IBAN (International Bank Account Number)",
    bankAccountPlaceholder: "e.g. DE89370400440532013000",
    registryAuthority: "Bundeszentralamt für Steuern (BZSt) & Handelsregister",
    registryAuthorityShort: "Handelsregister / BZSt",
    standardDocuments: [
      {
        id: "doc_corp_reg",
        name: "Handelsregisterauszug (Commercial Register Extract)",
        description: "Official Handelsregister certificate of registration. Valid for lifetime.",
        required: true,
        isLifetime: true,
      },
      {
        id: "doc_tax_cert",
        name: "Bescheinigung über die Registrierung (VAT Certificate)",
        description: "Official German VAT registration certificate issued by the tax office (Finanzamt).",
        required: true,
        isLifetime: false,
      },
      {
        id: "doc_bank_proof",
        name: "Bankbestätigung (Bank Account Confirmation)",
        description: "Official bank account certificate displaying IBAN and company legal entity name.",
        required: true,
        isLifetime: false,
      },
    ],
  },
};

export const DEFAULT_INTERNATIONAL_NORM: CountryNorm = {
  code: "INTL",
  name: "Other / International",
  currency: "USD",
  currencySymbol: "$",
  taxLabel: "National Business Tax Identification Number (TIN / VAT)",
  taxPlaceholder: "e.g. TX-98214-INTL",
  taxHint: "National corporate tax registration number",
  secondaryTaxLabel: "Commercial Registry / Trade License Number",
  secondaryTaxPlaceholder: "e.g. CRN-449102",
  secondaryTaxHint: "Official commercial registry or government trade license (Lifetime validity)",
  secondaryTaxIsLifetime: true,
  bankRoutingLabel: "SWIFT / BIC / Clearing Code",
  bankRoutingPlaceholder: "e.g. BOFAUS3N",
  bankRoutingHint: "International bank identification code (SWIFT/BIC)",
  bankAccountLabel: "International Bank Account / IBAN",
  bankAccountPlaceholder: "e.g. 10293847561029",
  registryAuthority: "National Chamber of Commerce & Tax Authority",
  registryAuthorityShort: "Trade Authority",
  standardDocuments: [
    {
      id: "doc_corp_reg",
      name: "Certificate of Incorporation / Commercial Trade License",
      description: "Official government trade license or certificate of incorporation. Valid for lifetime.",
      required: true,
      isLifetime: true,
    },
    {
      id: "doc_tax_cert",
      name: "National Tax Authority Registration Certificate",
      description: "Official certificate confirming corporate tax standing with national authority.",
      required: true,
      isLifetime: false,
    },
    {
      id: "doc_bank_proof",
      name: "Official Bank Confirmation Letter / Statement",
      description: "Bank letter confirming corporate account ownership and SWIFT routing credentials.",
      required: true,
      isLifetime: false,
    },
  ],
};

export function getCountryNorm(countryName?: string): CountryNorm {
  if (!countryName) return COUNTRY_NORMS["India"];
  const matched = COUNTRY_NORMS[countryName];
  if (matched) return matched;

  // Case-insensitive fallback
  const lower = countryName.toLowerCase().trim();
  for (const [k, v] of Object.entries(COUNTRY_NORMS)) {
    if (k.toLowerCase() === lower || v.code.toLowerCase() === lower) {
      return v;
    }
  }

  return {
    ...DEFAULT_INTERNATIONAL_NORM,
    name: countryName,
  };
}

/**
 * Checks whether the category represents a production or logistics entity.
 * Per specification: "Collect Insurance document if the supplier category is like production company or logistics kind of suppliers"
 */
export function isInsuranceRequiredForCategory(category?: string): boolean {
  if (!category) return false;
  const cat = category.toLowerCase().trim();
  return (
    cat.includes("product") ||
    cat.includes("manufactur") ||
    cat.includes("logistics") ||
    cat.includes("transport") ||
    cat.includes("freight") ||
    cat.includes("supply chain") ||
    cat.includes("warehouse") ||
    cat.includes("cargo") ||
    cat.includes("industrial")
  );
}

export const INSURANCE_DOCUMENT_REQUIREMENT: CountryDocRequirement = {
  id: "doc_insurance_cgl",
  name: "Commercial General Liability (CGL) / Goods-in-Transit Insurance Policy",
  description:
    "Mandatory comprehensive insurance policy for production, manufacturing, logistics, and freight operations covering liability and transit risks.",
  required: true,
  isLifetime: false, // Policies expire annually and require policy expiration date
  identifierConfig: {
    label: "Policy Number",
    placeholder: "e.g. CGL-POL-2026-1001",
    helperText: "Enter the policy number printed on the insurance certificate.",
  },
};

/**
 * Checks if a document has lifetime validity (GST, PAN, Incorporation Certificate, Bank Proof, etc.)
 * Per specification: GST, PAN, and company registration certificates do not have expiry.
 */
export function isLifetimeDocument(docId: string, docName: string): boolean {
  const lowerId = docId.toLowerCase();
  const lowerName = docName.toLowerCase();

  return (
    lowerId.includes("gst") ||
    lowerName.includes("gst") ||
    lowerId.includes("tax") ||
    lowerName.includes("tax registration") ||
    lowerName.includes("tax certificate") ||
    lowerId.includes("pan") ||
    lowerName.includes("pan") ||
    lowerId.includes("corp_reg") ||
    lowerId.includes("incorporation") ||
    lowerName.includes("incorporation") ||
    lowerName.includes("registration certificate") ||
    lowerName.includes("business registration") ||
    lowerName.includes("articles of incorporation") ||
    lowerName.includes("certificate of formation") ||
    lowerName.includes("w-9") ||
    lowerName.includes("acra business profile") ||
    lowerName.includes("handelsregister") ||
    lowerName.includes("trade license") ||
    lowerId.includes("bank") ||
    lowerName.includes("bank") ||
    lowerName.includes("cheque") ||
    lowerName.includes("statement")
  );
}

/**
 * Checks whether an expiry date picker is applicable for this document.
 * Documents like GST, PAN, Company Registration, and Bank Proof do NOT have expiry dates.
 * Only certifications, periodic licenses, and insurance policies (e.g. ISO 27001, Insurance, OSHA) have expiration dates.
 */
export function isExpiryApplicable(
  docId: string,
  docName: string,
  explicitRequiresExpiry?: boolean
): boolean {
  if (explicitRequiresExpiry === false) return false;
  if (isLifetimeDocument(docId, docName)) return false;
  if (explicitRequiresExpiry === true) return true;

  const lower = `${docId} ${docName}`.toLowerCase();
  return (
    lower.includes("insurance") ||
    lower.includes("iso") ||
    lower.includes("security") ||
    lower.includes("safety") ||
    lower.includes("osha") ||
    lower.includes("audit") ||
    lower.includes("policy") ||
    lower.includes("license") ||
    lower.includes("licence") ||
    lower.includes("permit")
  );
}
