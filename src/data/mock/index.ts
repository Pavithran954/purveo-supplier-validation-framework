import {
  RegistrationTemplate,
  SupplierSubmission,
  HybridRequest,
  BusinessRuleDefinition,
} from "@/types/builder";
import { evaluateSupplierSubmission } from "@/src/lib/validation";

export const initialTemplates: RegistrationTemplate[] = [
  {
    id: "tpl-global-supplier-2026",
    title: "Global Strategic Supplier Onboarding 2026",
    description: "Multi-tiered qualification program for global IT, Civil, and Manufacturing partners.",
    type: "HYBRID",
    validity: {
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    },
    invitedEmails: ["vendor@cloudbridge.example", "procure@acme.com"],
    basicFields: {
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      country: true,
      category: true,
      annualTurnover: true,
      expectedPurchaseValue: true,
      bankDetails: true,
      taxDetails: true,
      productsServices: true,
      companySize: true,
    },
    customFields: [
      {
        id: "cf_iso_certified",
        label: "Is your organization ISO 27001 Certified?",
        type: "boolean",
        required: true,
      },
      {
        id: "cf_iso_expiry",
        label: "ISO 27001 Certification Expiry Date",
        type: "date",
        required: true,
        visibilityRule: {
          matchType: "ALL",
          conditions: [
            {
              fieldId: "cf_iso_certified",
              operator: "EQUALS",
              value: "true",
            },
          ],
        },
      },
      {
        id: "cf_turnover_proof_details",
        label: "High Turnover Risk Mitigation Notes",
        type: "textarea",
        placeholder: "Provide audited financial disclosures for operations exceeding ₹50 Lakhs...",
        required: false,
        visibilityRule: {
          matchType: "ALL",
          conditions: [
            {
              fieldId: "annualTurnover",
              operator: "GREATER_THAN",
              value: 5000000,
            },
          ],
        },
      },
    ],
    documents: [
      {
        id: "doc_gst_cert",
        name: "GST Certificate / Tax Registration",
        categoryTrigger: "ALL",
        required: true,
        description: "Official GSTIN certificate showing active status",
        identifierConfig: {
          label: "GSTIN / Tax Registration Number",
          placeholder: "e.g. 29ABCDE1234F1Z5",
          helperText: "Enter the GSTIN printed on the certificate.",
        },
        maxSizeMb: 5,
        acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
        requiresExpiryDate: false,
      },
      {
        id: "doc_bank_proof",
        name: "Cancelled Cheque or Bank Statement",
        categoryTrigger: "ALL",
        required: true,
        description: "Must show account holder legal name, IFSC, and account number",
        identifierConfig: {
          label: "Bank Account Number",
          placeholder: "e.g. 98765432100012",
          helperText: "Enter the account number printed on the bank document.",
        },
        maxSizeMb: 5,
        acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
        requiresExpiryDate: false,
      },
      {
        id: "doc_it_security",
        name: "ISO 27001 / SOC 2 Security Audit Report",
        categoryTrigger: "IT",
        required: true,
        description: "Information security accreditation with non-expired audit period",
        identifierConfig: {
          label: "Certificate Number",
          placeholder: "e.g. ISO-27001-2026-1001",
          helperText: "Enter the certificate number issued by the certification body.",
        },
        maxSizeMb: 10,
        acceptedFileTypes: ["application/pdf"],
        requiresExpiryDate: true,
      },
      {
        id: "doc_safety_cert",
        name: "Site Safety Compliance & OSHA Form",
        categoryTrigger: "Civil",
        required: true,
        description: "Certified safety inspection audit for engineering operations",
        identifierConfig: {
          label: "Certificate / License Number",
          placeholder: "e.g. SAFETY-CERT-2026-1001",
          helperText: "Enter the identifier printed on the safety certificate.",
        },
        maxSizeMb: 5,
        acceptedFileTypes: ["application/pdf"],
        requiresExpiryDate: true,
      },
      {
        id: "doc_factory_lic",
        name: "Factory Operating License & ISO 9001",
        categoryTrigger: "Manufacturing",
        required: true,
        description: "Industrial plant license and quality assurance records",
        identifierConfig: {
          label: "Factory License Number",
          placeholder: "e.g. FACTORY-KA-2026-1001",
          helperText: "Enter the operating license number issued by the authority.",
        },
        maxSizeMb: 10,
        acceptedFileTypes: ["application/pdf"],
        requiresExpiryDate: true,
      },
      {
        id: "doc_financial_audit",
        name: "Audited Financial Balance Sheet (Last 2 Years)",
        categoryTrigger: "ALL",
        required: false,
        description: "Mandatory when expected purchase value or turnover exceeds ₹50 Lakhs",
        maxSizeMb: 15,
        acceptedFileTypes: ["application/pdf"],
        requiresExpiryDate: false,
      },
    ],
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "tpl-open-fasttrack",
    title: "Open Vendor Fast-Track Registration",
    description: "Open onboarding portal for general supplies, trading, and auxiliary services.",
    type: "OPEN",
    validity: {
      startDate: "2026-01-01",
      endDate: "2027-01-01",
    },
    basicFields: {
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      country: true,
      category: true,
      annualTurnover: false,
      bankDetails: true,
      taxDetails: true,
    },
    customFields: [
      {
        id: "cf_service_summary",
        label: "Executive Brief of Products & Services",
        type: "textarea",
        placeholder: "Briefly explain the primary catalogue items or services you deliver...",
        required: true,
      },
    ],
    documents: [
      {
        id: "doc_gst_cert",
        name: "GST Registration Certificate",
        categoryTrigger: "ALL",
        required: true,
        maxSizeMb: 5,
        acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
      },
      {
        id: "doc_company_profile",
        name: "Company Pitch Deck or Capability Profile",
        categoryTrigger: "ALL",
        required: true,
        maxSizeMb: 10,
        acceptedFileTypes: ["application/pdf"],
      },
    ],
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "tpl-closed-strategic",
    title: "Closed Critical Infrastructure Tender",
    description: "Restricted bidding for pre-screened mission-critical enterprise suppliers.",
    type: "CLOSED",
    validity: {
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    },
    invitedEmails: [
      "vendor@cloudbridge.example",
      "procure@acme.com",
      "director@metroinfra.example",
    ],
    basicFields: {
      companyName: true,
      contactPerson: true,
      email: true,
      country: true,
      category: true,
      annualTurnover: true,
      bankDetails: true,
      taxDetails: true,
    },
    customFields: [],
    documents: [
      {
        id: "doc_gst_cert",
        name: "GST Certificate",
        categoryTrigger: "ALL",
        required: true,
      },
      {
        id: "doc_financial_audit",
        name: "Audited Financials",
        categoryTrigger: "ALL",
        required: true,
      },
    ],
    createdAt: "2026-02-10T12:00:00.000Z",
  },
];

export const initialHybridRequests: HybridRequest[] = [
  {
    id: "hr_cloudbridge_882",
    templateId: "tpl-global-supplier-2026",
    companyName: "CloudBridge Systems Pvt. Ltd.",
    email: "ops@cloudbridge.example",
    category: "IT",
    aboutUs: "Specialized in cloud migration, DevSecOps, and enterprise SOC2 compliance services with 120+ engineers.",
    submittedAt: "2026-03-01T09:30:00.000Z",
    status: "APPROVED",
    adminNotes: "Pre-screening verified. Strong enterprise client references.",
  },
  {
    id: "hr_novalogistics_914",
    templateId: "tpl-global-supplier-2026",
    companyName: "Nova Logistics & Supply Chain",
    email: "connect@novalogistics.example",
    category: "Civil",
    aboutUs: "Cold-chain heavy logistics fleet covering all major metro industrial corridors with GPS telemetry.",
    submittedAt: "2026-03-04T14:15:00.000Z",
    status: "PENDING",
  },
];

// Calculate future dates for realistic mock expiry states
const now = new Date();
const expInFifteenDays = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const expInTwoYears = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const expiredThreeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

// 1. Benchmark Case: "ABC Technologies" matching PDF Page 5 & Page 6 exactly!
// (Score: 92/100, Documents: ⚠ One document expiring, Status: Approved)
const submissionAbcTechRaw: SupplierSubmission = {
  id: "sub_abc_tech_92",
  templateId: "tpl-global-supplier-2026",
  submittedAt: "2026-03-02T11:45:00.000Z",
  data: {
    companyName: "ABC Technologies Pvt Ltd",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@abctechnologies.example",
    country: "India",
    category: "IT",
    annualTurnover: 4500000,
    expectedPurchaseValue: 3500000,
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    bankAccount: "98765432100012",
    ifscCode: "HDFC0001234",
    cf_iso_certified: "true",
    cf_iso_expiry: expInFifteenDays, // Expiring soon!
  },
  documentsUploaded: [
    {
      docId: "doc_gst_cert",
      fileName: "ABC_Technologies_GST_Certificate.pdf",
      fileSize: 452000,
      fileType: "application/pdf",
      extractedEntityName: "ABC Technologies Pvt Ltd",
      extractedDocNumber: "29ABCDE1234F1Z5",
      isExpired: false,
      isExpiringSoon: false,
    },
    {
      docId: "doc_bank_proof",
      fileName: "ABC_Tech_Cancelled_Cheque.pdf",
      fileSize: 312000,
      fileType: "application/pdf",
      extractedEntityName: "ABC Technologies Pvt Ltd",
      isExpired: false,
      isExpiringSoon: false,
    },
    {
      docId: "doc_it_security",
      fileName: "ISO_27001_Audit_Certificate.pdf",
      fileSize: 1240000,
      fileType: "application/pdf",
      expiryDate: expInFifteenDays, // Expiring in 15 days!
      isExpired: false,
      isExpiringSoon: true, // Triggers "⚠ One document expiring"
    },
  ],
};

// 2. Mismatch Case: "XYZ Enterprises" matching PDF Page 4
// (GST: ABC Technologies vs Bank: XYZ Enterprises -> Possible mismatch / review required)
const submissionXyzMismatchRaw: SupplierSubmission = {
  id: "sub_xyz_mismatch_74",
  templateId: "tpl-global-supplier-2026",
  submittedAt: "2026-03-03T16:20:00.000Z",
  data: {
    companyName: "XYZ Enterprises Ltd",
    contactPerson: "Vikram Malhotra",
    email: "vikram@xyzent.example",
    country: "India",
    category: "IT",
    annualTurnover: 2800000,
    gstNumber: "27XYZAB9876C1Z3",
    panNumber: "XYZAB9876C",
    bankAccount: "5551234890123",
    ifscCode: "ICIC0000456",
    cf_iso_certified: "true",
    simulateNameMismatch: true,
  },
  documentsUploaded: [
    {
      docId: "doc_gst_cert",
      fileName: "XYZ_Enterprises_GST.pdf",
      fileSize: 390000,
      fileType: "application/pdf",
      extractedEntityName: "XYZ Enterprises Ltd",
    },
    {
      docId: "doc_bank_proof",
      fileName: "Bank_Passbook_Verified.pdf",
      fileSize: 280000,
      fileType: "application/pdf",
      extractedEntityName: "Alpex Trading Partners", // Mismatched entity!
      nameMatchStatus: "MISMATCH",
    },
    {
      docId: "doc_it_security",
      fileName: "SOC2_Type2_Report.pdf",
      fileSize: 950000,
      fileType: "application/pdf",
      expiryDate: expInTwoYears,
      isExpired: false,
      isExpiringSoon: false,
    },
  ],
};

// 3. High Turnover Case (> ₹50 Lakhs)
const submissionMetroInfraRaw: SupplierSubmission = {
  id: "sub_metro_infra_96",
  templateId: "tpl-global-supplier-2026",
  submittedAt: "2026-03-04T08:10:00.000Z",
  data: {
    companyName: "Metro Infrastructure Engineers",
    contactPerson: "Sunil Shenoy",
    email: "tenders@metroinfra.example",
    country: "India",
    category: "Civil",
    annualTurnover: 8500000, // > ₹50 Lakhs
    expectedPurchaseValue: 6000000,
    gstNumber: "29METRO9999P1Z2",
    panNumber: "METRO9999P",
    bankAccount: "11223344556677",
    ifscCode: "SBIN0004512",
  },
  documentsUploaded: [
    {
      docId: "doc_gst_cert",
      fileName: "Metro_GST_Registration.pdf",
      fileSize: 420000,
      extractedEntityName: "Metro Infrastructure Engineers",
    },
    {
      docId: "doc_bank_proof",
      fileName: "SBI_Current_Account_Proof.pdf",
      fileSize: 290000,
      extractedEntityName: "Metro Infrastructure Engineers",
    },
    {
      docId: "doc_safety_cert",
      fileName: "Civil_Safety_OSHA_Audit.pdf",
      fileSize: 850000,
      expiryDate: expInTwoYears,
    },
    {
      docId: "doc_financial_audit",
      fileName: "Audited_Balance_Sheet_2025.pdf",
      fileSize: 2400000,
    },
  ],
};

// 4. Critical Failure Case: Expired Document
const submissionApexFailedRaw: SupplierSubmission = {
  id: "sub_apex_expired_52",
  templateId: "tpl-global-supplier-2026",
  submittedAt: "2026-03-04T12:00:00.000Z",
  data: {
    companyName: "Apex Heavy Fabrication Pvt Ltd",
    contactPerson: "Arun Joshi",
    email: "arun@apexfab.example",
    country: "India",
    category: "Manufacturing",
    annualTurnover: 3200000,
    gstNumber: "24APEXF1111Q1Z8",
    panNumber: "APEXF1111Q",
    bankAccount: "44556677889900",
    ifscCode: "BARB0BENGAL",
  },
  documentsUploaded: [
    {
      docId: "doc_gst_cert",
      fileName: "Apex_GST_2024.pdf",
      fileSize: 310000,
    },
    {
      docId: "doc_factory_lic",
      fileName: "Factory_License_Expired.pdf",
      fileSize: 680000,
      expiryDate: expiredThreeMonthsAgo, // Expired!
      isExpired: true,
    },
  ],
};

// 5. Fully compliant case: all enabled checks pass and no document is near expiry.
const submissionPerfectScoreRaw: SupplierSubmission = {
  id: "sub_perfect_score_100",
  templateId: "tpl-global-supplier-2026",
  submittedAt: "2026-03-05T10:00:00.000Z",
  data: {
    companyName: "Evergreen Cloud Services Pvt Ltd",
    contactPerson: "Ananya Mehta",
    email: "compliance@evergreencloud.example",
    phone: "+91 98765 43210",
    address: "Manyata Tech Park, Bengaluru, Karnataka",
    country: "India",
    category: "IT",
    annualTurnover: 4500000,
    expectedPurchaseValue: 3500000,
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    bankAccount: "98765432100012",
    ifscCode: "HDFC0001234",
    companySize: "51-200",
    productsServices: "Cloud infrastructure, managed security, and enterprise software services.",
    supplyingItemName: "Managed Cloud Security Platform",
    itemDescription: "24/7 monitoring, incident response, and enterprise SLA support.",
    unitOfMeasurement: "User Licenses (Seat)",
    unitPrice: 125000,
    unitPriceMin: 100000,
    unitPriceMax: 150000,
    cf_iso_certified: "true",
    cf_iso_expiry: expInTwoYears,
  },
  documentsUploaded: [
    {
      docId: "doc_gst_cert",
      fileName: "Evergreen_Cloud_GST_Certificate.pdf",
      fileSize: 452000,
      fileType: "application/pdf",
      extractedEntityName: "Evergreen Cloud Services Pvt Ltd",
      extractedDocNumber: "29ABCDE1234F1Z5",
      isExpired: false,
      isExpiringSoon: false,
    },
    {
      docId: "doc_bank_proof",
      fileName: "Evergreen_Cloud_Cancelled_Cheque.pdf",
      fileSize: 312000,
      fileType: "application/pdf",
      extractedEntityName: "Evergreen Cloud Services Pvt Ltd",
      extractedDocNumber: "98765432100012",
      isExpired: false,
      isExpiringSoon: false,
    },
    {
      docId: "doc_it_security",
      fileName: "Evergreen_ISO_27001_Certificate.pdf",
      fileSize: 1240000,
      fileType: "application/pdf",
      expiryDate: expInTwoYears,
      extractedEntityName: "Evergreen Cloud Services Pvt Ltd",
      extractedDocNumber: "ISO-27001-2022-1001",
      isExpired: false,
      isExpiringSoon: false,
    },
  ],
};

// Evaluate reports for each pre-seeded submission
const tplGlobal = initialTemplates[0];

submissionAbcTechRaw.validationReport = evaluateSupplierSubmission(tplGlobal, submissionAbcTechRaw);
submissionAbcTechRaw.validationScore = submissionAbcTechRaw.validationReport.score;
submissionAbcTechRaw.validationStatus = submissionAbcTechRaw.validationReport.status;

submissionXyzMismatchRaw.validationReport = evaluateSupplierSubmission(tplGlobal, submissionXyzMismatchRaw);
submissionXyzMismatchRaw.validationScore = submissionXyzMismatchRaw.validationReport.score;
submissionXyzMismatchRaw.validationStatus = submissionXyzMismatchRaw.validationReport.status;

submissionMetroInfraRaw.validationReport = evaluateSupplierSubmission(tplGlobal, submissionMetroInfraRaw);
submissionMetroInfraRaw.validationScore = submissionMetroInfraRaw.validationReport.score;
submissionMetroInfraRaw.validationStatus = submissionMetroInfraRaw.validationReport.status;

submissionApexFailedRaw.validationReport = evaluateSupplierSubmission(tplGlobal, submissionApexFailedRaw);
submissionApexFailedRaw.validationScore = submissionApexFailedRaw.validationReport.score;
submissionApexFailedRaw.validationStatus = submissionApexFailedRaw.validationReport.status;

submissionPerfectScoreRaw.validationReport = evaluateSupplierSubmission(tplGlobal, submissionPerfectScoreRaw);
submissionPerfectScoreRaw.validationScore = submissionPerfectScoreRaw.validationReport.score;
submissionPerfectScoreRaw.validationStatus = submissionPerfectScoreRaw.validationReport.status;

export const initialSubmissions: SupplierSubmission[] = [
  submissionAbcTechRaw,
  submissionXyzMismatchRaw,
  submissionMetroInfraRaw,
  submissionApexFailedRaw,
  submissionPerfectScoreRaw,
];

export const SYSTEM_BUSINESS_RULES: BusinessRuleDefinition[] = [
  {
    id: "br-01",
    name: "GSTIN Structural & Authoritative Status Verification",
    description: "Validates 15-character GST syntax and simulates authoritative MCA/GSTN registry query.",
    category: "COMPLIANCE",
    conditionSummary: "GST number provided is verified against external database",
    actionSummary: "Confirm Active status and state jurisdiction",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-02",
    name: "Permanent Account Number (PAN) Consistency",
    description: "Ensures PAN 10-character checksum matches Indian tax registry guidelines.",
    category: "COMPLIANCE",
    conditionSummary: "Country is India",
    actionSummary: "Verify PAN structure (5 letters, 4 digits, 1 letter) or extract from GSTIN",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-03",
    name: "Cross-Document Legal Entity Name Consistency (Page 4)",
    description: "Compares registered form company name against names extracted from Tax and Banking certificates.",
    category: "IDENTITY",
    conditionSummary: "Form Name == GST Certificate Entity Name == Bank Account Holder Name",
    actionSummary: "If mismatch detected (e.g. GST: ABC Tech vs Bank: XYZ Enterprises), set status to REVIEW_REQUIRED",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-04",
    name: "High Value Purchase Risk Control (> ₹50 Lakhs) (Page 5)",
    description: "Suppliers bidding or declaring turnover over ₹50 Lakhs must attach audited balance sheets.",
    category: "FINANCIAL",
    conditionSummary: "Expected Purchase Value or Annual Turnover > ₹5,000,000",
    actionSummary: "Trigger mandatory upload of Audited Financial Balance Sheet (Last 2 Years)",
    severity: "WARNING",
    enabled: true,
  },
  {
    id: "br-05",
    name: "IT Supplier Information Security Governance (ISO 27001) (Page 5)",
    description: "IT & Technology vendors must supply ISO 27001 or SOC 2 report to protect data security.",
    category: "COMPLIANCE",
    conditionSummary: "Supplier Category == 'IT'",
    actionSummary: "Require ISO 27001 Certificate and track certificate expiry date",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-06",
    name: "Civil & Construction Workplace Safety Standard (Page 3/5)",
    description: "Construction and engineering suppliers must hold certified OSHA safety compliance.",
    category: "COMPLIANCE",
    conditionSummary: "Supplier Category == 'Civil'",
    actionSummary: "Require Site Safety Compliance & OSHA Certificate",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-07",
    name: "Manufacturing Industrial Operating License",
    description: "Industrial suppliers must hold an active factory operating license and ISO 9001 audit.",
    category: "COMPLIANCE",
    conditionSummary: "Supplier Category == 'Manufacturing'",
    actionSummary: "Require Factory Operating License & Quality Audit",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-08",
    name: "Strict Document Expiry Guard (Page 5)",
    description: "If any mandatory document is expired, the supplier must not be automatically approved.",
    category: "DOCUMENT",
    conditionSummary: "Any uploaded document Expiry Date < Current Date",
    actionSummary: "Block automatic approval; demote status to Review Required or Rejected",
    severity: "CRITICAL",
    enabled: true,
  },
  {
    id: "br-09",
    name: "Document Expiry Advance Warning (Page 6)",
    description: "Flags documents expiring within 30 days with a warning indicator.",
    category: "DOCUMENT",
    conditionSummary: "Current Date <= Expiry Date <= (Current Date + 30 Days)",
    actionSummary: "Flag summary table with '⚠ One document expiring' and score adjustment",
    severity: "WARNING",
    enabled: true,
  },
  {
    id: "br-10",
    name: "Banking Credentials & Routing Verification",
    description: "Validates minimum account number length and format of IFSC/SWIFT routing code.",
    category: "FINANCIAL",
    conditionSummary: "Bank Account Number length >= 6 and valid routing syntax",
    actionSummary: "Mark Bank Details Verified",
    severity: "CRITICAL",
    enabled: true,
  },
];

export const initialCategories: string[] = [
  "IT",
  "Civil",
  "Manufacturing",
  "Healthcare, Pharma & Food Processing",
  "Logistics",
];
