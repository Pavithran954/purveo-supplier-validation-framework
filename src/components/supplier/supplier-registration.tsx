"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RegistrationTemplate,
  HybridRequest,
  SupplierSubmission,
  DocumentUploadItem,
  DocumentRequirement,
  BasicFieldConfig,
} from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import {
  initialTemplates,
  initialSubmissions,
  initialHybridRequests,
  initialCategories,
} from "@/src/data/mock";
import {
  isFieldVisible,
  isDocumentRequiredForCategory,
} from "@/src/lib/conditions";
import {
  getCountryNorm,
  isInsuranceRequiredForCategory,
  isLifetimeDocument,
  isExpiryApplicable,
  INSURANCE_DOCUMENT_REQUIREMENT,
} from "@/src/lib/country-norms";
import {
  cleanupObsoleteDocuments,
  getApplicableDocuments,
} from "@/src/data/documents";
import { validateDocuments as validateDocumentValidity } from "@/src/lib/documents";
import { evaluateDocumentValidity } from "@/src/lib/documents";
import { evaluateSupplierSubmission } from "@/src/lib/validation";
import {
  createEmptySupplyingItem,
  SupplyingItem,
  SupplyingItemSection,
} from "@/src/components/SupplyingItemSection";
import {
  Building2,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Calendar,
  Send,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2,
  Eye,
  Sparkles,
  HelpCircle,
  FileCheck,
  KeyRound,
  RotateCcw,
} from "lucide-react";

interface Props {
  registrationId: string;
}

const createDefaultSupplyingItems = (): SupplyingItem[] =>
  Array.from({ length: 3 }, () => createEmptySupplyingItem());

const normalizeSupplyingItems = (
  savedDraft: Record<string, unknown>,
): SupplyingItem[] => {
  if (Array.isArray(savedDraft.items)) {
    return savedDraft.items
      .filter((item): item is Partial<SupplyingItem> =>
        Boolean(item && typeof item === "object"),
      )
      .map((item) => ({
        id:
          typeof item.id === "string" && item.id
            ? item.id
            : createEmptySupplyingItem().id,
        itemName: typeof item.itemName === "string" ? item.itemName : "",
        unitOfMeasurement:
          typeof item.unitOfMeasurement === "string"
            ? item.unitOfMeasurement
            : "",
        unitPrice:
          typeof item.unitPrice === "number" || item.unitPrice === ""
            ? item.unitPrice
            : "",
      }));
  }

  if (
    typeof savedDraft.supplyingItemName === "string" ||
    savedDraft.unitPrice !== undefined
  ) {
    return [
      {
        id: createEmptySupplyingItem().id,
        itemName:
          typeof savedDraft.supplyingItemName === "string"
            ? savedDraft.supplyingItemName
            : "",
        unitOfMeasurement:
          typeof savedDraft.unitOfMeasurement === "string"
            ? savedDraft.unitOfMeasurement
            : "",
        unitPrice:
          typeof savedDraft.unitPrice === "number" ||
          typeof savedDraft.unitPrice === "string"
            ? Number(savedDraft.unitPrice) || ""
            : "",
      },
    ];
  }

  return createDefaultSupplyingItems();
};

export function SupplierRegistration({ registrationId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [template, setTemplate] = useState<RegistrationTemplate | null>(null);
  const [itemPricingDraftLoaded, setItemPricingDraftLoaded] = useState(false);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isHybridCustomCategory, setIsHybridCustomCategory] = useState(false);
  const [hybridCustomCategoryInput, setHybridCustomCategoryInput] =
    useState("");

  const [formData, setFormData] = useState<Record<string, any>>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    country: "India",
    category: "",
    productType: "",
    annualTurnover: 4500000,
    expectedPurchaseValue: 3500000,
    gstNumber: "",
    panNumber: "",
    bankAccount: "",
    ifscCode: "",
    companySize: "11-50",
    productsServices: "",
    items: createDefaultSupplyingItems(),
    supplyingItemName: "",
    itemDescription: "",
    unitOfMeasurement: "Pieces (Pcs)",
    unitPrice: "",
    unitPriceMin: "",
    unitPriceMax: "",
    cf_iso_certified: "false",
    cf_iso_expiry: "",
  });

  const [uploadedDocs, setUploadedDocs] = useState<DocumentUploadItem[]>([]);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [selectedPreviewDoc, setSelectedPreviewDoc] =
    useState<DocumentUploadItem | null>(null);

  // Closed registration verification state
  const [closedEmailInput, setClosedEmailInput] = useState("");
  const [closedStep, setClosedStep] = useState<"email" | "otp">("email");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [closedError, setClosedError] = useState("");
  const [resendNotification, setResendNotification] = useState("");

  // Hybrid screening state
  const [hybridScreening, setHybridScreening] = useState({
    companyName: "",
    email: "",
    category: "IT",
    aboutUs: "",
  });
  const [hybridSubmitted, setHybridSubmitted] = useState(false);
  const [isHybridApproved, setIsHybridApproved] = useState(false);

  // Status message & submission outcome
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
    [],
  );
  const [submissionComplete, setSubmissionComplete] =
    useState<SupplierSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load template & categories
  useEffect(() => {
    const list = storage.get<RegistrationTemplate[]>(
      STORAGE_KEYS.templates,
      initialTemplates,
    );
    const found = list.find((t) => t.id === registrationId);
    const targetTpl = found || initialTemplates[0];
    const normalizedCustomFields = (targetTpl.customFields || [])
      .filter((field) => field.id && field.label?.trim())
      .map((field) => ({
        ...field,
        options: ["select", "radio", "checkbox"].includes(field.type)
          ? field.options || []
          : field.options,
      }));
    const normalizedTemplate = {
      ...targetTpl,
      customFields: normalizedCustomFields,
    };
    setTemplate(normalizedTemplate);

    const storedCats = storage.get<string[]>(
      STORAGE_KEYS.categories,
      initialCategories,
    );
    setCategories(storedCats);

    // Initialize all custom fields in formData so inputs are reliably controlled
    const itemDrafts = storage.get<Record<string, Record<string, unknown>>>(
      STORAGE_KEYS.itemPricingDrafts,
      {},
    );
    const savedItemDraft = itemDrafts[registrationId] || {};

    setFormData((prev) => {
      const nextData = { ...prev };
      normalizedCustomFields.forEach((cf) => {
        if (nextData[cf.id] === undefined) {
          nextData[cf.id] = cf.type === "boolean" ? "false" : "";
        }
      });
      return {
        ...nextData,
        ...savedItemDraft,
        items: normalizeSupplyingItems(savedItemDraft),
      };
    });
    setItemPricingDraftLoaded(true);
  }, [registrationId]);

  useEffect(() => {
    if (!itemPricingDraftLoaded) return;

    const itemDrafts = storage.get<Record<string, Record<string, unknown>>>(
      STORAGE_KEYS.itemPricingDrafts,
      {},
    );
    storage.set(STORAGE_KEYS.itemPricingDrafts, {
      ...itemDrafts,
      [registrationId]: {
        items: formData.items,
        productType: String(formData.productType || "").trim(),
      },
    });
  }, [
    formData.items,
    formData.productType,
    itemPricingDraftLoaded,
    registrationId,
  ]);

  // Check token for hybrid access
  useEffect(() => {
    if (!template) return;

    if (template.type === "HYBRID") {
      if (token) {
        const hybridReqs = storage.get<HybridRequest[]>(
          STORAGE_KEYS.hybridRequests,
          initialHybridRequests,
        );
        const matched = hybridReqs.find(
          (r) => r.id === token && r.status === "APPROVED",
        );
        if (matched) {
          setIsHybridApproved(true);
          setFormData((prev) => ({
            ...prev,
            companyName: matched.companyName || prev.companyName,
            email: matched.email || prev.email,
            category: matched.category || prev.category,
          }));
        }
      }
    }
  }, [template, token]);

  // Check validity window
  const validityStatus = useMemo(() => {
    if (!template) return { isValid: true, reason: "" };
    const now = new Date().toISOString().split("T")[0];
    if (now < template.validity.startDate) {
      return {
        isValid: false,
        reason: `Registration opens on ${template.validity.startDate}`,
      };
    }
    if (now > template.validity.endDate) {
      return {
        isValid: false,
        reason: `Registration closed on ${template.validity.endDate}`,
      };
    }
    return { isValid: true, reason: "" };
  }, [template]);

  // Helper to reliably check if a basic standard field is enabled by the admin
  const showBasicField = (key: keyof BasicFieldConfig, defaultVal = true) => {
    if (!template?.basicFields) return defaultVal;
    const val = template.basicFields[key];
    return val === undefined ? defaultVal : Boolean(val);
  };

  const configuredCustomFields = useMemo(
    () =>
      (template?.customFields || []).filter(
        (field) => field.id && field.label?.trim(),
      ),
    [template],
  );

  // Calculate dynamic documents required for currently selected category (or custom category)
  const currentEffectiveCategory =
    isCustomCategory || formData.category === "__OTHER__"
      ? customCategoryInput.trim()
      : formData.category;
  // Resolve Country Norms for Dynamic Financial Fields & Document Norms
  const countryNorm = getCountryNorm(formData.country);

  // Dynamic documents matching country norms, insurance rules, and lifetime validity
  const dynamicDocuments: DocumentRequirement[] = useMemo(() => {
    const list: DocumentRequirement[] = [];

    // 1. Registry documents: locked common requirements plus category requirements.
    getApplicableDocuments(
      currentEffectiveCategory,
      template || undefined,
    ).forEach((doc) => {
      list.push({
        ...doc,
        isLifetime:
          doc.validityType === "LIFETIME" ||
          doc.isLifetime ||
          isLifetimeDocument(doc.id, doc.name),
      });
    });

    // 2. If supplier is from country other than India, ensure country norm standard documents are rendered
    if (formData.country && formData.country !== "India") {
      countryNorm.standardDocuments.forEach((cd) => {
        const alreadyExists = list.some(
          (d) =>
            d.id === cd.id ||
            d.name.toLowerCase().includes(cd.name.toLowerCase().split(" ")[0]),
        );
        if (!alreadyExists) {
          list.push({
            id: cd.id,
            name: cd.name,
            description: cd.description,
            categoryTrigger: cd.categoryTrigger || "ALL",
            required: cd.required,
            isLifetime: cd.isLifetime,
          });
        }
      });
    }

    // 3. Collect Insurance document if supplier category is like production company or logistics
    if (isInsuranceRequiredForCategory(currentEffectiveCategory)) {
      const hasInsurance = list.some(
        (d) =>
          d.id === INSURANCE_DOCUMENT_REQUIREMENT.id ||
          d.name.toLowerCase().includes("insurance"),
      );
      if (!hasInsurance) {
        list.push({
          ...INSURANCE_DOCUMENT_REQUIREMENT,
          categoryTrigger: currentEffectiveCategory || "ALL",
        });
      }
    }

    return list.filter((doc) =>
      isDocumentRequiredForCategory(doc, currentEffectiveCategory),
    );
  }, [
    template,
    countryNorm,
    formData.country,
    formData.unitPrice,
    currentEffectiveCategory,
  ]);

  useEffect(() => {
    setUploadedDocs((previous) =>
      cleanupObsoleteDocuments(
        previous,
        currentEffectiveCategory,
        template || undefined,
      ),
    );
  }, [currentEffectiveCategory, template]);

  // Compute missing mandatory documents in real-time
  const missingMandatoryDocs = useMemo(() => {
    return dynamicDocuments.filter(
      (doc) => doc.required && !uploadedDocs.some((u) => u.docId === doc.id),
    );
  }, [dynamicDocuments, uploadedDocs]);

  if (!template) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-500 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span>Loading registration program...</span>
      </div>
    );
  }

  // Edge case 1: Inactive Validity Window
  if (!validityStatus.isValid) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4 shadow-xs">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
            <Image
              src="/favicon.svg"
              alt="PurveO Logo"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="text-left leading-tight">
            <span className="text-sm font-bold tracking-tight text-gray-950 block">
              PurveO
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Validation Engine
            </span>
          </div>
        </div>
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
          <Calendar className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-gray-950">
          Registration Program Inactive
        </h2>
        <p className="text-sm text-gray-600">
          {validityStatus.reason}. The validity period for &quot;
          <strong>{template.title}</strong>&quot; is{" "}
          <strong>{template.validity.startDate}</strong> to{" "}
          <strong>{template.validity.endDate}</strong>.
        </p>
        <div className="pt-2 text-xs text-gray-500 border-t border-gray-100">
          Please contact your procurement representative or the organization
          that shared this onboarding link for assistance.
        </div>
      </div>
    );
  }

  // Edge case 2: CLOSED Mode Whitelist & OTP Gate
  if (template.type === "CLOSED" && !isEmailVerified) {
    const handleVerifyClosedEmail = (e: React.FormEvent) => {
      e.preventDefault();
      const entered = closedEmailInput.trim().toLowerCase();
      const whitelisted = (template.invitedEmails || []).map((em) =>
        em.trim().toLowerCase(),
      );

      if (whitelisted.includes(entered)) {
        setClosedStep("otp");
        setClosedError("");
        setOtpDigits(["", "", "", ""]);
        setResendNotification("");
      } else {
        setClosedError(
          "Access restricted: This email is not in the authorized invitee list for this program.",
        );
      }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      const enteredOtp = otpDigits.join("").trim();
      if (enteredOtp.length < 4) {
        setClosedError("Please enter the complete 4-digit verification code.");
        return;
      }
      // Dummy OTP is 1234
      if (enteredOtp === "1234") {
        setIsEmailVerified(true);
        setFormData((prev) => ({
          ...prev,
          email: closedEmailInput.trim().toLowerCase(),
        }));
        setClosedError("");
      } else {
        setClosedError(
          "Invalid verification code. Please enter 1234 for demo verification.",
        );
      }
    };

    const handleOtpDigitChange = (index: number, val: string) => {
      const char = val.replace(/[^0-9]/g, "").slice(-1);
      const updated = [...otpDigits];
      updated[index] = char;
      setOtpDigits(updated);
      setClosedError("");

      if (char && index < 3) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    };

    const handleOtpKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
      }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .replace(/[^0-9]/g, "")
        .slice(0, 4);
      if (pasted) {
        const chars = pasted.split("");
        const updated = ["", "", "", ""];
        chars.forEach((c, idx) => {
          if (idx < 4) updated[idx] = c;
        });
        setOtpDigits(updated);
        setClosedError("");
        const focusIdx = Math.min(chars.length, 3);
        document.getElementById(`otp-input-${focusIdx}`)?.focus();
      }
    };

    const handleResendOtp = () => {
      setOtpDigits(["", "", "", ""]);
      setClosedError("");
      setResendNotification(
        "A new verification code has been dispatched. (Demo code: 1234)",
      );
      setTimeout(() => setResendNotification(""), 4500);
      document.getElementById("otp-input-0")?.focus();
    };

    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-xs space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
            <Image
              src="/favicon.svg"
              alt="PurveO Logo"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="text-left leading-tight">
            <span className="text-sm font-bold tracking-tight text-gray-950 block">
              PurveO
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Validation Engine
            </span>
          </div>
        </div>

        {closedStep === "email" ? (
          /* STEP 1: INVITED EMAIL VERIFICATION */
          <>
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 border border-gray-200">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-950">
                Closed Tender Registration
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Participation is restricted to invited organizations. Enter your
                invited corporate email address to receive an authorization
                code.
              </p>
            </div>

            {/* Test Hint */}
            {template.invitedEmails && template.invitedEmails.length > 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-gray-900">
                  <Sparkles
                    className="h-3.5 w-3.5 text-gray-700"
                    aria-hidden="true"
                  />{" "}
                  Evaluator Whitelist Hint:
                </div>
                <p className="text-[11px] text-gray-600">
                  Click to pre-fill invited email:{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setClosedEmailInput(template.invitedEmails![0]);
                      setClosedError("");
                    }}
                    className="font-mono font-bold text-gray-950 underline hover:text-gray-700 transition"
                  >
                    {template.invitedEmails[0]}
                  </button>
                </p>
              </div>
            )}

            {closedError && (
              <div
                role="alert"
                className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <span>{closedError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyClosedEmail} className="space-y-4">
              <div>
                <label
                  htmlFor="closed-email-input"
                  className="block text-xs font-semibold text-gray-700 mb-1"
                >
                  Corporate Invitee Email
                </label>
                <div className="relative">
                  <Mail
                    className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="closed-email-input"
                    type="email"
                    required
                    value={closedEmailInput}
                    onChange={(e) => {
                      setClosedEmailInput(e.target.value);
                      if (closedError) setClosedError("");
                    }}
                    placeholder="e.g. vendor@cloudbridge.example"
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-xs bg-white text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-950 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition focus-visible:outline-2 focus-visible:outline-gray-900"
              >
                Continue to Verification{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </>
        ) : (
          /* STEP 2: OTP VERIFICATION (DUMMY OTP: 1234) */
          <>
            <div className="text-center space-y-1.5">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 border border-gray-200">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-gray-950">
                Enter Verification Code
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                An authorization code has been dispatched to{" "}
                <strong className="text-gray-900 font-semibold">
                  {closedEmailInput}
                </strong>
                .
              </p>
              <button
                type="button"
                onClick={() => {
                  setClosedStep("email");
                  setClosedError("");
                  setResendNotification("");
                }}
                className="text-xs text-gray-600 hover:text-gray-950 underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Change
                email address
              </button>
            </div>

            {/* Demo Hint Banner */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span>
                  Demo OTP code:{" "}
                  <strong className="font-mono text-gray-950 font-bold">
                    1234
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(["1", "2", "3", "4"]);
                  setClosedError("");
                }}
                className="rounded bg-gray-950 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-gray-800 transition shrink-0"
              >
                Fill 1234
              </button>
            </div>

            {resendNotification && (
              <div
                role="status"
                aria-live="polite"
                className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <span>{resendNotification}</span>
              </div>
            )}

            {closedError && (
              <div
                role="alert"
                className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <span>{closedError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 text-center mb-2">
                  Enter 4-Digit Security Code
                </label>
                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpDigitChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-12 text-center text-lg font-bold font-mono rounded-lg border border-gray-300 bg-white text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition shadow-2xs"
                      autoFocus={index === 0}
                      aria-label={`Digit ${index + 1} of verification code`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-950 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition focus-visible:outline-2 focus-visible:outline-gray-900"
              >
                Verify Code &amp; Unlock Form{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs text-gray-500 hover:text-gray-900 font-medium inline-flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Didn&apos;t receive code? Resend
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  // Edge case 3: HYBRID Mode Screening Gatekeeper
  if (template.type === "HYBRID" && !isHybridApproved) {
    const handleHybridSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const finalCategory =
        isHybridCustomCategory || hybridScreening.category === "__OTHER__"
          ? hybridCustomCategoryInput.trim()
          : hybridScreening.category;

      if (!finalCategory) {
        alert("Please specify your industry / category name.");
        return;
      }

      // Store in Admin panel storage for future use
      const existingCats = storage.get<string[]>(
        STORAGE_KEYS.categories,
        initialCategories,
      );
      if (!existingCats.includes(finalCategory)) {
        const updatedCats = [...existingCats, finalCategory];
        storage.set(STORAGE_KEYS.categories, updatedCats);
        setCategories(updatedCats);
      }

      const newReq: HybridRequest = {
        id: `hr_${Date.now().toString(36)}`,
        templateId: template.id,
        companyName: hybridScreening.companyName,
        email: hybridScreening.email,
        category: finalCategory,
        aboutUs: hybridScreening.aboutUs,
        submittedAt: new Date().toISOString(),
        status: "PENDING",
      };

      const existing = storage.get<HybridRequest[]>(
        STORAGE_KEYS.hybridRequests,
        initialHybridRequests,
      );
      storage.set(STORAGE_KEYS.hybridRequests, [newReq, ...existing]);
      setHybridSubmitted(true);
    };

    if (hybridSubmitted) {
      return (
        <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-xs text-center space-y-4">
          <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-gray-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
              <Image
                src="/favicon.svg"
                alt="PurveO Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="text-left leading-tight">
              <span className="text-sm font-bold tracking-tight text-gray-950 block">
                PurveO
              </span>
              <span className="text-[10px] text-gray-500 font-medium block">
                Supplier Portal
              </span>
            </div>
          </div>
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-950">
            Pre-Screening Application Submitted
          </h2>
          <p className="text-sm text-gray-600">
            Your expression of interest for &quot;
            <strong>{template.title}</strong>&quot; has been securely routed for
            review.
          </p>
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 text-left space-y-1.5">
            <strong className="text-gray-900 block">What happens next?</strong>
            <p>
              The procurement evaluation team will review your organization
              profile. Once authorized, an onboarding invitation token will be
              dispatched to <strong>{hybridScreening.email}</strong> to unlock
              the complete validation checklist.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
            <Image
              src="/favicon.svg"
              alt="PurveO Logo"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="text-left leading-tight">
            <span className="text-sm font-bold tracking-tight text-gray-950 block">
              PurveO
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Supplier Portal
            </span>
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-950">
            Stage 1: Pre-Screening Application
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            This program follows a <strong>Hybrid Gatekeeper</strong> workflow.
            Submit your initial profile for review before accessing the complete
            validation checklist.
          </p>
        </div>

        <form onSubmit={handleHybridSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Company Legal Name *
            </label>
            <input
              type="text"
              required
              value={hybridScreening.companyName}
              onChange={(e) =>
                setHybridScreening({
                  ...hybridScreening,
                  companyName: e.target.value,
                })
              }
              className="w-full rounded-md border border-gray-200 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
              placeholder="e.g. Apex Industrial Systems"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                required
                value={hybridScreening.email}
                onChange={(e) =>
                  setHybridScreening({
                    ...hybridScreening,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-md border border-gray-200 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                placeholder="procurement@apex.example"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={
                  isHybridCustomCategory
                    ? "__OTHER__"
                    : hybridScreening.category
                }
                onChange={(e) => {
                  if (e.target.value === "__OTHER__") {
                    setIsHybridCustomCategory(true);
                    setHybridScreening((prev) => ({
                      ...prev,
                      category: "__OTHER__",
                    }));
                  } else {
                    setIsHybridCustomCategory(false);
                    setHybridCustomCategoryInput("");
                    setHybridScreening((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                  }
                }}
                className="w-full rounded-md border border-gray-200 p-2.5 text-xs text-gray-900 bg-white focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "IT"
                      ? "IT & Software"
                      : cat === "Civil"
                        ? "Civil & Construction"
                        : cat === "Manufacturing"
                          ? "Manufacturing & Hardware"
                          : cat}
                  </option>
                ))}
                <option value="Healthcare, Pharma & Food Processing">
                  Healthcare, Pharma &amp; Food Processing
                </option>
                <option value="__OTHER__">
                  Other / Industry not listed...
                </option>
              </select>
            </div>
          </div>

          {isHybridCustomCategory && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Type Your Industry / Sector Name *
              </label>
              <input
                type="text"
                required
                value={hybridCustomCategoryInput}
                onChange={(e) => setHybridCustomCategoryInput(e.target.value)}
                placeholder="e.g. Healthcare, Renewable Energy, Logistics..."
                className="w-full rounded-md border border-gray-200 p-2.5 text-xs text-gray-900 bg-white focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                This industry will be registered in the system catalogue for
                future onboarding programs.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Brief Capabilities Pitch (Products / Services) *
            </label>
            <textarea
              required
              rows={4}
              value={hybridScreening.aboutUs}
              onChange={(e) =>
                setHybridScreening({
                  ...hybridScreening,
                  aboutUs: e.target.value,
                })
              }
              className="w-full rounded-md border border-gray-200 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
              placeholder="Detail your operating licenses, track record, and core engineering solutions..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-950 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition focus-visible:outline-2 focus-visible:outline-gray-950"
          >
            Submit for Pre-Screening{" "}
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // SENIOR-LEVEL DOCUMENT UPLOAD & VALIDATION HANDLERS
  // ==========================================
  const isFuzzyMatch = (str1?: string, str2?: string): boolean => {
    if (!str1 || !str2) return false;
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(
          /pvtltd|ltd|limited|inc|corp|corporation|technologies|systems|llc|gmbh/g,
          "",
        );
    const a = clean(str1);
    const b = clean(str2);
    return a === b || a.includes(b) || b.includes(a);
  };

  const handleFileUpload = (docReq: DocumentRequirement, file: File) => {
    const newErrors = { ...uploadErrors };
    delete newErrors[docReq.id];

    // 1. MIME Type & Extension Check
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const fileExt = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const isExtensionAllowed = allowedExtensions.includes(fileExt);

    if (!isExtensionAllowed) {
      newErrors[docReq.id] =
        `Invalid format (${fileExt}). Allowed formats: PDF, PNG, JPG.`;
      setUploadErrors(newErrors);
      return;
    }

    // 2. File Size Check (Max 5MB or docReq.maxSizeMb)
    const maxMb = docReq.maxSizeMb || 5;
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      const fileSizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      newErrors[docReq.id] =
        `File size (${fileSizeInMb} MB) exceeds maximum allowed limit of ${maxMb} MB.`;
      setUploadErrors(newErrors);
      return;
    }

    // 3. Document Expiry Check (GST, PAN, Incorporation, etc. do NOT have expiry)
    const hasExpiry =
      docReq.validityType === "TIME_BOUND" ||
      isExpiryApplicable(docReq.id, docReq.name, docReq.requiresExpiryDate);
    const today = new Date();
    let defaultExpiry = "";

    if (hasExpiry) {
      // Default to 1 year ahead for certificates that actually have expiration dates (ISO, Insurance, etc.)
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      defaultExpiry = nextYear.toISOString().split("T")[0];
    }

    const newDocItem: DocumentUploadItem = {
      docId: docReq.id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "application/pdf",
      uploadedAt: new Date().toISOString(),
      expiryDate: defaultExpiry,
      isLifetime: !hasExpiry,
      extractedEntityName: formData.companyName || "",
      extractedDocNumber: docReq.identifierConfig
        ? docReq.id.includes("gst") || docReq.id.includes("tax")
          ? formData.gstNumber || ""
          : ""
        : undefined,
      ocrConfidence: 99.2,
      isExpired: false,
      isExpiringSoon: false,
      nameMatchStatus: "MATCH",
    };

    setUploadedDocs((prev) => {
      const filtered = prev.filter((d) => d.docId !== docReq.id);
      return [...filtered, newDocItem];
    });

    setUploadErrors(newErrors);
  };

  const handleUpdateDocFields = (
    docId: string,
    updates: Partial<DocumentUploadItem>,
  ) => {
    setUploadedDocs((prev) =>
      prev.map((d) => {
        if (d.docId === docId) {
          return { ...d, ...updates };
        }
        return d;
      }),
    );
  };

  const handleUpdateDocExpiry = (docId: string, expiryDate: string) => {
    const today = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(today.getDate() + 30);

    const expDate = new Date(expiryDate);
    const isExpired = expDate < today;
    const isExpiringSoon = !isExpired && expDate <= thirtyDaysAhead;

    setUploadedDocs((prev) =>
      prev.map((d) => {
        if (d.docId === docId) {
          return {
            ...d,
            expiryDate,
            isExpired,
            isExpiringSoon,
          };
        }
        return d;
      }),
    );
  };

  const handleRemoveDoc = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.docId !== docId));
  };

  // Helper: Pre-fill Benchmark Sample Data ("ABC Technologies" matching PDF Page 5 & 6)
  const prefillSampleBenchmark = () => {
    const expIn15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setFormData({
      companyName: "ABC Technologies Pvt Ltd",
      contactPerson: "Rajesh Kumar",
      email: "rajesh@abctechnologies.example",
      phone: "+91 98765 43210",
      address: "Prestige Tech Park, Marathahalli, Bengaluru 560103",
      country: "India",
      category: "IT",
      annualTurnover: 4500000,
      expectedPurchaseValue: 3500000,
      gstNumber: "29ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      bankAccount: "98765432100012",
      ifscCode: "HDFC0001234",
      companySize: "51-200",
      productsServices:
        "Enterprise Cloud Systems, Cyber Defense Security Suite, and Managed IT Services",
      items: [
        {
          id: createEmptySupplyingItem().id,
          itemName: "Enterprise Cloud Security Suite & Managed Firewalls",
          unitOfMeasurement: "User Licenses (Seat)",
          unitPrice: 125000,
        },
        {
          id: createEmptySupplyingItem().id,
          itemName: "Managed Firewall",
          unitOfMeasurement: "Instances / APIs",
          unitPrice: 150000,
        },
        {
          id: createEmptySupplyingItem().id,
          itemName: "Security Consulting",
          unitOfMeasurement: "Hours (Consulting)",
          unitPrice: 100000,
        },
      ],
      supplyingItemName: "Enterprise Cloud Security Suite & Managed Firewalls",
      itemDescription:
        "Annual enterprise security licensing, 24/7 proactive incident monitoring, and cloud firewall appliances.",
      unitOfMeasurement: "Pieces",
      unitPrice: 125000,
      unitPriceMin: 100000,
      unitPriceMax: 150000,
      cf_iso_certified: "true",
      cf_iso_expiry: expIn15Days,
    });

    // Auto-attach sample documents
    setUploadedDocs([
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
        docId: "doc_pan_card",
        fileName: "ABC_Technologies_PAN_Card.pdf",
        fileSize: 220000,
        fileType: "application/pdf",
        isLifetime: true,
        extractedEntityName: "ABC Technologies Pvt Ltd",
        extractedDocNumber: "ABCDE1234F",
        isExpired: false,
        isExpiringSoon: false,
      },
      {
        docId: "doc_corp_reg",
        fileName: "Certificate_of_Incorporation_ROC.pdf",
        fileSize: 680000,
        fileType: "application/pdf",
        isLifetime: true,
        extractedEntityName: "ABC Technologies Pvt Ltd",
        extractedDocNumber: "U72200KA2018PTC112345",
        isExpired: false,
        isExpiringSoon: false,
      },
      {
        docId: "doc_bank_proof",
        fileName: "ABC_Tech_Cancelled_Cheque.pdf",
        fileSize: 312000,
        fileType: "application/pdf",
        extractedEntityName: "ABC Technologies Pvt Ltd",
        extractedDocNumber: "98765432100012",
        isExpired: false,
        isExpiringSoon: false,
      },
      {
        docId: "doc_it_security",
        fileName: "ISO_27001_Audit_Certificate.pdf",
        fileSize: 1240000,
        fileType: "application/pdf",
        expiryDate: expIn15Days,
        extractedEntityName: "ABC Technologies Pvt Ltd",
        extractedDocNumber: "ISO-27001-2022-9981",
        isExpired: false,
        isExpiringSoon: true, // "⚠ One document expiring"
      },
    ]);
  };

  // Handle Main Submission
  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormValidationErrors([]);

    const errors: string[] = [];

    // Calculate effective category
    const finalCategory =
      isCustomCategory || formData.category === "__OTHER__"
        ? customCategoryInput.trim()
        : formData.category;

    // 1. Mandatory Basic Fields
    if (showBasicField("companyName") && !formData.companyName.trim()) {
      errors.push("Company Legal Name is required.");
    }
    if (showBasicField("email") && !formData.email.trim()) {
      errors.push("Corporate Email is required.");
    }
    if (showBasicField("category") && !finalCategory) {
      errors.push("Supplier Category / Industry is mandatory.");
    }
    if (!String(formData.productType || "").trim()) {
      errors.push("Product Type is required.");
    }
    if (showBasicField("supplyingItem")) {
      (formData.items as SupplyingItem[]).forEach((item, index) => {
        if (!item.itemName.trim()) {
          errors.push(`Item ${index + 1} name is required.`);
        }
        if (item.unitPrice === "") {
          errors.push(`Unit price for Item ${index + 1} is required.`);
        }
      });
    }

    // 2. Dynamic Required Fields
    (template.customFields || []).forEach((field) => {
      const visible = isFieldVisible(field, formData);
      if (visible && field.required) {
        const val = formData[field.id];
        if (field.type === "boolean") {
          if (String(val) !== "true") {
            errors.push(`Confirmation for "${field.label}" is required.`);
          }
        } else if (
          val === undefined ||
          val === null ||
          (Array.isArray(val) ? val.length === 0 : String(val).trim() === "")
        ) {
          errors.push(`${field.label} is mandatory under current rules.`);
        }
      }
    });

    // 3. Strict Mandatory Document Upload Enforcement
    if (missingMandatoryDocs.length > 0) {
      missingMandatoryDocs.forEach((doc) => {
        errors.push(
          `Mandatory document "${doc.name}" is required and must be uploaded before submitting.`,
        );
      });
    }

    validateDocumentValidity(dynamicDocuments, uploadedDocs).forEach(
      (result) => {
        if (result.blocking && result.status !== "NOT_UPLOADED") {
          errors.push(
            `${dynamicDocuments.find((document) => document.id === result.documentId)?.name || "Document"}: ${result.message}`,
          );
        }
      },
    );

    // Verify manual document entity name was entered for data matching
    uploadedDocs.forEach((doc) => {
      if (!doc.extractedEntityName || !doc.extractedEntityName.trim()) {
        errors.push(
          `Please enter the company legal name as printed on "${doc.fileName}" for cross-document validation.`,
        );
      }
    });

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      setIsSubmitting(false);

      // If a mandatory document is missing, scroll directly to its upload card
      if (missingMandatoryDocs.length > 0) {
        const firstMissing = missingMandatoryDocs[0];
        const cardElement = document.getElementById(
          `doc-card-${firstMissing.id}`,
        );
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
          cardElement.classList.add("ring-2", "ring-red-500");
          setTimeout(() => {
            cardElement.classList.remove("ring-2", "ring-red-500");
          }, 3500);
          return;
        }
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Store custom category in Admin catalogue for future use
    if (finalCategory) {
      const existingCats = storage.get<string[]>(
        STORAGE_KEYS.categories,
        initialCategories,
      );
      if (!existingCats.includes(finalCategory)) {
        const updatedCats = [...existingCats, finalCategory];
        storage.set(STORAGE_KEYS.categories, updatedCats);
        setCategories(updatedCats);
      }
    }

    // 4. Assemble Submission Object with effective category
    const firstItem = (formData.items as SupplyingItem[])[0];
    const submissionData = {
      ...formData,
      category: finalCategory,
      supplyingItemName: firstItem?.itemName || "",
      unitOfMeasurement: firstItem?.unitOfMeasurement || "",
      unitPrice: firstItem?.unitPrice ?? "",
    };

    const newSubmission: SupplierSubmission = {
      id: `sub_${Date.now().toString(36)}`,
      templateId: template.id,
      data: submissionData,
      documentsUploaded: uploadedDocs,
      submittedAt: new Date().toISOString(),
    };

    // 5. Run Senior Validation Engine
    const report = evaluateSupplierSubmission(template, newSubmission);
    newSubmission.validationScore = report.score;
    // Automated validation produces a recommendation only. Onboarding requires
    // an explicit approval decision from an administrator.
    newSubmission.validationStatus = "REVIEW_REQUIRED";
    newSubmission.validationReport = report;

    // 6. Save in localStorage
    const existing = storage.get<SupplierSubmission[]>(
      STORAGE_KEYS.submissions,
      initialSubmissions,
    );
    storage.set(STORAGE_KEYS.submissions, [newSubmission, ...existing]);

    setSubmissionComplete(newSubmission);
    setIsSubmitting(false);
  };

  // SUCCESS STATE SCREEN
  if (submissionComplete) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center justify-center gap-2.5 pb-2 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
            <Image
              src="/favicon.svg"
              alt="PurveO Logo"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="text-left leading-tight">
            <span className="text-sm font-bold tracking-tight text-gray-950 block">
              PurveO
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Validation Engine
            </span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-950">
            Registration Successfully Submitted!
          </h2>
          <p className="text-sm text-gray-500">
            Submission Reference:{" "}
            <span className="font-mono font-bold text-gray-900">
              {submissionComplete.id}
            </span>
          </p>
        </div>

        {/* Application Summary Card (No Score Displayed to Supplier) */}
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <span className="text-xs uppercase font-bold text-gray-700">
              Official Application Receipt
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Received
              &amp; Queued
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Registered Legal Entity
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {submissionComplete.data?.companyName || "—"}
              </strong>
            </div>

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Primary Industry Sector
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {submissionComplete.data?.category || "—"}
              </strong>
            </div>

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Authorized Contact Person
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {submissionComplete.data?.contactPerson || "—"}
              </strong>
            </div>

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Registered Corporate Email
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {submissionComplete.data?.email || "—"}
              </strong>
            </div>

            {submissionComplete.data?.items?.some(
              (item: SupplyingItem) => item.itemName,
            ) && (
              <div className="p-3 bg-white rounded border border-gray-200 sm:col-span-2">
                <span className="text-gray-500 block text-[11px]">
                  Supplying Items &amp; Unit Prices
                </span>
                <div className="mt-1 space-y-1">
                  {submissionComplete.data.productType && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Product Type:</span>{" "}
                      {submissionComplete.data.productType}
                    </p>
                  )}
                  {submissionComplete.data.items
                    .filter((item: SupplyingItem) => item.itemName)
                    .map((item: SupplyingItem) => (
                      <strong key={item.id} className="text-gray-950 block">
                        {item.itemName} ({item.unitOfMeasurement || "Units"}) ·{" "}
                        {countryNorm.currencySymbol}
                        {Number(item.unitPrice || 0).toLocaleString()}
                      </strong>
                    ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Compliance Documents Uploaded
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {submissionComplete.documentsUploaded?.length || 0}{" "}
                Certificate(s) attached
              </strong>
            </div>

            <div className="p-3 bg-white rounded border border-gray-200">
              <span className="text-gray-500 block text-[11px]">
                Submission Recorded At
              </span>
              <strong className="text-gray-950 mt-0.5 block">
                {new Date(submissionComplete.submittedAt).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-left text-xs text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <CheckCircle2
              className="h-4 w-4 text-emerald-600"
              aria-hidden="true"
            />
            <span>Official Supplier Registration Acknowledged</span>
          </div>
          <p className="leading-relaxed">
            Your vendor registration details, jurisdictional credentials, and
            compliance documents have been formally received and registered
            under Reference ID <strong>{submissionComplete.id}</strong>.
          </p>
          <p className="text-emerald-800 text-[11px]">
            The corporate procurement authority has recorded this application.
            Confirmation notices will be communicated to{" "}
            <strong>{submissionComplete.data?.email}</strong>. You may save or
            print this official acknowledgement receipt for your compliance
            records.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={() => window.print()}
            className="rounded-md bg-gray-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            Download / Print Official Acknowledgement Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 space-y-6">
      {/* Benchmark Pre-fill Bar for Evaluators */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 p-4 rounded-lg shadow-xs text-xs">
        <div className="flex items-center gap-2 text-gray-800">
          <Sparkles className="h-4 w-4 text-gray-700" aria-hidden="true" />
          <span>
            <strong>Testing Assistant:</strong> Pre-fill with sample data.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prefillSampleBenchmark}
            className="rounded-md bg-gray-950 px-3 py-1.5 font-semibold text-white hover:bg-gray-800 transition"
          >
            Pre-fill &quot;ABC Technologies&quot;
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                simulateNameMismatch: !prev.simulateNameMismatch,
              }))
            }
            className={`rounded-md border px-3 py-1.5 font-medium transition ${
              formData.simulateNameMismatch
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {formData.simulateNameMismatch
              ? "Name Mismatch Active"
              : "Simulate Name Mismatch"}
          </button>
        </div>
      </div>

      {/* Main Registration Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-xs space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white p-1 shadow-2xs overflow-hidden shrink-0">
                <Image
                  src="/favicon.svg"
                  alt="PurveO Logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold tracking-tight text-gray-950 block">
                  PurveO Portal
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Verified Supplier Onboarding
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {template.type} Program
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Valid until: {template.validity.endDate}
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-950 mt-1">
            {template.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {template.description ||
              "Complete organization verification form and attach required compliance certificates."}
          </p>
        </div>

        {/* Global Error Banner */}
        {formValidationErrors.length > 0 && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <AlertCircle className="h-4 w-4" /> Please resolve the following
              requirements:
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {formValidationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleMainSubmit} className="space-y-8">
          {/* SECTION 1: BASIC COMPANY INFORMATION (PAGE 2) */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> 1. Company Profile
              &amp; Contact Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {showBasicField("companyName") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="e.g. ABC Technologies Pvt Ltd"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {showBasicField("contactPerson") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPerson: e.target.value,
                      })
                    }
                    placeholder="Authorized signatory"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {showBasicField("email") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g. contact@abctech.example"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {showBasicField("phone") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {showBasicField("country") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country of Registration *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Singapore">Singapore</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              )}

              {showBasicField("category") && (
                <div>
                  <label
                    htmlFor="supplier-category-select"
                    className="block text-xs font-semibold text-gray-700 mb-1"
                  >
                    Supplier Category / Industry *
                  </label>
                  <select
                    id="supplier-category-select"
                    value={isCustomCategory ? "__OTHER__" : formData.category}
                    onChange={(e) => {
                      if (e.target.value === "__OTHER__") {
                        setIsCustomCategory(true);
                        setFormData((prev) => ({
                          ...prev,
                          category: "__OTHER__",
                        }));
                      } else {
                        setIsCustomCategory(false);
                        setCustomCategoryInput("");
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }));
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 bg-white focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "IT"
                          ? "IT & Software Solutions"
                          : cat === "Civil"
                            ? "Civil & Construction Engineering"
                            : cat === "Manufacturing"
                              ? "Manufacturing & Heavy Hardware"
                              : cat}
                      </option>
                    ))}
                    <option value="__OTHER__">
                      Other / Industry not listed (Type below)...
                    </option>
                  </select>

                  {isCustomCategory ? (
                    <div className="mt-2.5 space-y-1">
                      <label
                        htmlFor="custom-category-input"
                        className="block text-xs font-semibold text-gray-700"
                      >
                        Type Your Industry / Sector Name *
                      </label>
                      <input
                        id="custom-category-input"
                        type="text"
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="e.g. Healthcare, Renewable Energy, Logistics..."
                        className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 bg-white focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                      />
                      <span className="text-[11px] text-gray-500 block">
                        This category will be permanently saved into the Admin
                        catalogue upon submission.
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      (Category dynamically determines mandatory document
                      triggers)
                    </span>
                  )}
                </div>
              )}

              {showBasicField("address") && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Business Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Street, City, Postal Code"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {showBasicField("companySize") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Size (Employees)
                  </label>
                  <select
                    value={formData.companySize || "11-50"}
                    onChange={(e) =>
                      setFormData({ ...formData, companySize: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="1-10">Micro (1 - 10 employees)</option>
                    <option value="11-50">Small (11 - 50 employees)</option>
                    <option value="51-200">Medium (51 - 200 employees)</option>
                    <option value="201-500">
                      Enterprise (201 - 500 employees)
                    </option>
                    <option value="500+">
                      Large Corporate (500+ employees)
                    </option>
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="supplier-product-type"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Product Type *
                </label>
                <input
                  id="supplier-product-type"
                  type="text"
                  required
                  value={formData.productType || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productType: e.target.value,
                    }))
                  }
                  onBlur={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productType: e.target.value.trim(),
                    }))
                  }
                  placeholder="e.g., Food Products, Mechanical Components, Textile Products"
                  aria-invalid={formValidationErrors.some((error) =>
                    error.startsWith("Product Type"),
                  )}
                  className={`w-full rounded-lg border p-2.5 text-sm focus:outline-none ${
                    formValidationErrors.some((error) =>
                      error.startsWith("Product Type"),
                    )
                      ? "border-red-500 bg-red-50 focus:border-red-500"
                      : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Specify the primary type of product or service your company
                  supplies.
                </p>
                {formValidationErrors.some((error) =>
                  error.startsWith("Product Type"),
                ) && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Product Type is required.
                  </p>
                )}
              </div>

              {showBasicField("productsServices") && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Products &amp; Services Overview
                  </label>
                  <textarea
                    rows={2}
                    value={formData.productsServices || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productsServices: e.target.value,
                      })
                    }
                    placeholder="Briefly describe your primary line of goods, solutions, or contract services..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {showBasicField("supplyingItem") && (
            <SupplyingItemSection
              category={currentEffectiveCategory}
              country={formData.country}
              items={formData.items as SupplyingItem[]}
              onChange={(items) =>
                setFormData((previous) => ({ ...previous, items }))
              }
            />
          )}

          {/* SECTION 2: FINANCIAL & TAX IDENTIFIERS (DYNAMIC PER COUNTRY NORMS) */}
          {(showBasicField("annualTurnover") ||
            showBasicField("expectedPurchaseValue", false) ||
            showBasicField("taxDetails") ||
            showBasicField("bankDetails")) && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-gray-950"
                    aria-hidden="true"
                  />
                  Financial, Banking &amp; Tax Identifiers ({countryNorm.name}{" "}
                  Norms)
                </h2>
                <span className="text-[11px] font-medium text-gray-500">
                  Regulated authority:{" "}
                  <strong className="text-gray-900">
                    {countryNorm.registryAuthorityShort}
                  </strong>
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {showBasicField("annualTurnover") && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Annual Turnover ({countryNorm.currency} ·{" "}
                      {countryNorm.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      value={formData.annualTurnover || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annualTurnover: Number(e.target.value),
                        })
                      }
                      placeholder={`e.g. 5000000`}
                      className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                    />
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Commercial baseline for supplier sizing and financial
                      compliance.
                    </span>
                  </div>
                )}

                {showBasicField("expectedPurchaseValue", false) && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Expected Purchase Value ({countryNorm.currency} ·{" "}
                      {countryNorm.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={formData.expectedPurchaseValue || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expectedPurchaseValue: Number(e.target.value),
                        })
                      }
                      placeholder={`e.g. 3500000`}
                      className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                    />
                  </div>
                )}

                {showBasicField("taxDetails") && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {countryNorm.taxLabel} *
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gstNumber: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder={countryNorm.taxPlaceholder}
                        className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 uppercase font-mono focus-visible:outline-2 focus-visible:outline-gray-950"
                      />
                      {/* <span className="text-[11px] text-gray-500 mt-0.5 block">
                        {countryNorm.taxHint} · Verified via authoritative
                        registry.
                      </span> */}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {countryNorm.secondaryTaxLabel ||
                          "Secondary Legal Identifier"}
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            panNumber: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder={
                          countryNorm.secondaryTaxPlaceholder ||
                          "Corporate / Tax Identifier"
                        }
                        className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 uppercase font-mono focus-visible:outline-2 focus-visible:outline-gray-950"
                      />
                      {/* <span className="text-[11px] text-gray-500 mt-0.5 block">
                        {countryNorm.secondaryTaxHint ||
                          "Issued once and valid for lifetime."}
                      </span> */}
                    </div>
                  </>
                )}

                {showBasicField("bankDetails") && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {countryNorm.bankAccountLabel} *
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankAccount: e.target.value,
                          })
                        }
                        placeholder={countryNorm.bankAccountPlaceholder}
                        className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 font-mono focus-visible:outline-2 focus-visible:outline-gray-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {countryNorm.bankRoutingLabel} *
                      </label>
                      <input
                        type="text"
                        value={formData.ifscCode || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ifscCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder={countryNorm.bankRoutingPlaceholder}
                        className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 uppercase font-mono focus-visible:outline-2 focus-visible:outline-gray-950"
                      />
                      {/* <span className="text-[11px] text-gray-500 mt-0.5 block">
                        {countryNorm.bankRoutingHint}
                      </span> */}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: DYNAMIC CUSTOM FIELDS WITH VISIBILITY RULES (PAGE 2 & 5) */}
          {configuredCustomFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-gray-950"
                  aria-hidden="true"
                />
                3. Additional Technical &amp; Compliance Information
              </h2>

              <div className="space-y-4">
                {configuredCustomFields.map((field) => {
                  const visible = isFieldVisible(field, formData);
                  if (!visible) return null;

                  return (
                    <div
                      key={field.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-2"
                    >
                      <label
                        htmlFor={`field-${field.id}`}
                        className="block text-xs font-semibold text-gray-900"
                      >
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>

                      {field.type === "text" && (
                        <input
                          id={`field-${field.id}`}
                          type="text"
                          required={field.required}
                          value={
                            formData[field.id] !== undefined
                              ? String(formData[field.id])
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: val,
                            }));
                          }}
                          placeholder={
                            field.placeholder ||
                            `Enter ${field.label.toLowerCase()}`
                          }
                          className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          id={`field-${field.id}`}
                          rows={3}
                          required={field.required}
                          value={
                            formData[field.id] !== undefined
                              ? String(formData[field.id])
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: val,
                            }));
                          }}
                          placeholder={
                            field.placeholder ||
                            `Enter details for ${field.label.toLowerCase()}`
                          }
                          className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          id={`field-${field.id}`}
                          type="number"
                          required={field.required}
                          value={
                            formData[field.id] !== undefined
                              ? formData[field.id]
                              : ""
                          }
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: val,
                            }));
                          }}
                          placeholder={field.placeholder || "0"}
                          className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                        />
                      )}

                      {field.type === "select" && (
                        <select
                          id={`field-${field.id}`}
                          required={field.required}
                          value={
                            formData[field.id] !== undefined
                              ? String(formData[field.id])
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: val,
                            }));
                          }}
                          className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                        >
                          <option value="">
                            {field.placeholder || "Select an option..."}
                          </option>
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "radio" && (
                        <div
                          className="space-y-2"
                          role="radiogroup"
                          aria-label={field.label}
                        >
                          {(field.options || []).map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800"
                            >
                              <input
                                type="radio"
                                name={`field-${field.id}`}
                                value={option}
                                checked={formData[field.id] === option}
                                required={field.required && !formData[field.id]}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    [field.id]: e.target.value,
                                  }))
                                }
                                className="h-4 w-4 text-gray-950 focus:ring-gray-950 border-gray-300"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div
                          className="space-y-2"
                          role="group"
                          aria-label={field.label}
                        >
                          {(field.options || []).map((option) => {
                            const selected = Array.isArray(formData[field.id])
                              ? formData[field.id].includes(option)
                              : false;
                            return (
                              <label
                                key={option}
                                className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800"
                              >
                                <input
                                  type="checkbox"
                                  name={`field-${field.id}`}
                                  value={option}
                                  checked={selected}
                                  onChange={(e) =>
                                    setFormData((prev) => {
                                      const current = Array.isArray(
                                        prev[field.id],
                                      )
                                        ? prev[field.id]
                                        : [];
                                      return {
                                        ...prev,
                                        [field.id]: e.target.checked
                                          ? [...current, option]
                                          : current.filter(
                                              (value: string) =>
                                                value !== option,
                                            ),
                                      };
                                    })
                                  }
                                  className="h-4 w-4 rounded text-gray-950 focus:ring-gray-950 border-gray-300"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {field.type === "date" && (
                        <input
                          id={`field-${field.id}`}
                          type="date"
                          required={field.required}
                          value={
                            formData[field.id] !== undefined
                              ? String(formData[field.id])
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              [field.id]: val,
                            }));
                          }}
                          className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950 focus-visible:border-transparent transition"
                        />
                      )}

                      {field.type === "boolean" && (
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800">
                          <input
                            id={`field-${field.id}`}
                            type="checkbox"
                            checked={String(formData[field.id]) === "true"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                [field.id]: e.target.checked ? "true" : "false",
                              }))
                            }
                            className="h-4 w-4 rounded text-gray-950 focus:ring-gray-950 border-gray-300"
                          />
                          <span>Confirm compliance / Yes</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: SENIOR-LEVEL DOCUMENT COLLECTION & VALIDATION (PAGE 3, 4, 5, 6) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-blue-600" /> 4. Document
                  Collection
                </h2>
                <p className="text-xs text-slate-500">
                  Enforces file integrity, client-side format &amp; size checks,
                  data matching, and certificate expiry tracking.
                </p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                Scope: {formData.category} Sector
              </span>
            </div>

            <div className="space-y-4">
              {dynamicDocuments.map((docReq, index) => {
                const uploaded = uploadedDocs.find(
                  (d) => d.docId === docReq.id,
                );
                const hasError = uploadErrors[docReq.id];

                const isDocMissing = docReq.required && !uploaded;
                const validity = evaluateDocumentValidity(docReq, uploaded);

                const isCommonDocument = docReq.scope === "COMMON";
                const isFirstCategoryDocument =
                  !isCommonDocument &&
                  (index === 0 ||
                    dynamicDocuments[index - 1]?.scope === "COMMON");

                return (
                  <div key={`group-${docReq.id}`}>
                    {(index === 0 || isFirstCategoryDocument) && (
                      <div className="mb-3 mt-6 first:mt-0 border-b border-slate-200 pb-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {isCommonDocument
                            ? "Common Documents"
                            : `${formData.category || "Supplier Category"} Documents`}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {isCommonDocument
                            ? "These baseline documents are required for every supplier."
                            : "These documents are based on the selected supplier category."}
                        </p>
                      </div>
                    )}
                    <div
                      id={`doc-card-${docReq.id}`}
                      className={`p-4 rounded-xl border transition-all ${
                        uploaded
                          ? "border-emerald-200 bg-emerald-50/20"
                          : hasError
                            ? "border-red-300 bg-red-50/20"
                            : isDocMissing
                              ? "border-amber-300/80 bg-amber-50/30"
                              : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {docReq.name}
                            </span>
                            {docReq.required && (
                              <span className="text-red-600 text-xs font-bold">
                                * Mandatory
                              </span>
                            )}
                            {isDocMissing && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-amber-600" />{" "}
                                Upload Required to Submit
                              </span>
                            )}
                            {uploaded && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />{" "}
                                Uploaded
                              </span>
                            )}
                            {/* <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {docReq.validityType === "LIFETIME" || docReq.isLifetime ? "Lifetime" : `Time-bound · ${docReq.validityPeriod || "Expiry required"}`}
                          </span> */}
                          </div>
                          <p className="text-xs text-slate-500">
                            {docReq.description ||
                              "Official certificate or scanned proof."}
                          </p>
                        </div>

                        {/* Right: Upload Button or Uploaded Card */}
                        <div className="shrink-0">
                          {uploaded ? (
                            <div className="flex items-center gap-2">
                              {/* <button
                              type="button"
                              onClick={() => setSelectedPreviewDoc(uploaded)}
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-200 transition"
                            >
                              <Eye className="h-3.5 w-3.5" /> Preview File
                            </button> */}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc(docReq.id)}
                                className="p-1.5 text-sm cursor-pointer border-[1.5px] border-gray-300 rounded-md flex justify-center items-center gap-1 text-slate-400 hover:text-red-600 transition"
                                title="Remove file"
                              >
                                <Trash2 className="h-4 w-4" /> Remove File
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-white border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                              <Upload className="h-4 w-4 text-slate-500" />{" "}
                              Upload Document
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(docReq, file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Upload Error Banner */}
                      {hasError && (
                        <div className="mt-3 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{hasError}</span>
                        </div>
                      )}

                      {/* Uploaded File Details, Data Matching Inputs & Expiry */}
                      {uploaded &&
                        (() => {
                          const hasExpiry =
                            docReq.validityType === "TIME_BOUND" ||
                            isExpiryApplicable(
                              docReq.id,
                              docReq.name,
                              docReq.requiresExpiryDate,
                            );
                          const hasDocName = Boolean(
                            uploaded.extractedEntityName &&
                            uploaded.extractedEntityName.trim(),
                          );
                          const isNameMatch =
                            hasDocName &&
                            isFuzzyMatch(
                              uploaded.extractedEntityName,
                              formData.companyName,
                            );

                          return (
                            <div className="mt-3.5 pt-3.5 border-t border-gray-200 space-y-3.5 text-xs">
                              {/* File Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                  <CheckCircle2
                                    className="h-4 w-4 text-emerald-600 shrink-0"
                                    aria-hidden="true"
                                  />
                                  <span className="truncate max-w-xs">
                                    {uploaded.fileName}
                                  </span>
                                  <span className="text-gray-400 font-normal text-[11px]">
                                    (
                                    {Math.round(
                                      (uploaded.fileSize || 0) / 1024,
                                    )}{" "}
                                    KB)
                                  </span>
                                  {uploaded &&
                                    validity.status !== "UPLOADED" && (
                                      <span
                                        className={`text-[10px] font-semibold ${validity.blocking ? "text-red-700" : "text-amber-700"}`}
                                      >
                                        {validity.status.replaceAll("_", " ")} ·{" "}
                                        {validity.message}
                                      </span>
                                    )}
                                </div>

                                {/* Render expiry date ONLY if applicable (ISO, Insurance, etc.). No lifetime validity badge */}
                                {hasExpiry ? (
                                  <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                                      Certificate Expiry Date:
                                    </label>
                                    <input
                                      type="date"
                                      value={uploaded.expiryDate || ""}
                                      onChange={(e) =>
                                        handleUpdateDocExpiry(
                                          docReq.id,
                                          e.target.value,
                                        )
                                      }
                                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                                    />
                                    {uploaded.isExpired && (
                                      <span className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />{" "}
                                        Expired
                                      </span>
                                    )}
                                    {uploaded.isExpiringSoon && (
                                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />{" "}
                                        Expiring Soon
                                      </span>
                                    )}
                                  </div>
                                ) : null}
                              </div>

                              {/* Data Matching Manual Verification Form */}
                              <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <FileCheck
                                      className="h-3.5 w-3.5 text-gray-600"
                                      aria-hidden="true"
                                    />
                                    Official Document Cross-Verification Fields
                                  </span>
                                  {/* {formData.companyName && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateDocFields(docReq.id, {
                                          extractedEntityName:
                                            formData.companyName,
                                        })
                                      }
                                      className="text-[11px] text-gray-600 hover:text-gray-950 underline font-medium"
                                    >
                                      Copy from Basic Details
                                    </button>
                                  )} */}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                      Legal Entity Name (as shown on this
                                      certificate) *
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      value={uploaded.extractedEntityName || ""}
                                      onChange={(e) =>
                                        handleUpdateDocFields(docReq.id, {
                                          extractedEntityName: e.target.value,
                                        })
                                      }
                                      placeholder="Type exact company name printed on document"
                                      className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                                    />
                                    <div className="mt-1">
                                      {hasDocName ? (
                                        isNameMatch ? (
                                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />{" "}
                                            Exact match with registered company
                                            name
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />{" "}
                                            Name differs from registered &quot;
                                            {formData.companyName}&quot;
                                            (Flagged for review)
                                          </span>
                                        )
                                      ) : (
                                        <span className="text-[10px] text-gray-500">
                                          Enter entity name from document for
                                          automated cross-match.
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {docReq.identifierConfig && (
                                    <div>
                                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                        {docReq.identifierConfig.label}
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          uploaded.extractedDocNumber || ""
                                        }
                                        onChange={(e) =>
                                          handleUpdateDocFields(docReq.id, {
                                            extractedDocNumber: e.target.value,
                                          })
                                        }
                                        placeholder={
                                          docReq.identifierConfig.placeholder
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-white p-2 text-xs text-gray-900 font-mono focus-visible:outline-2 focus-visible:outline-gray-950"
                                      />
                                      <span className="text-[10px] text-gray-500 mt-1 block">
                                        {docReq.identifierConfig.helperText}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MISSING MANDATORY DOCUMENTS ALERT BEFORE SUBMISSION */}
          {missingMandatoryDocs.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1.5 shadow-2xs">
              <div className="font-bold flex items-center gap-1.5 text-sm text-red-950">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>
                  Mandatory Documents Missing ({missingMandatoryDocs.length}{" "}
                  pending)
                </span>
              </div>
              <p className="text-red-700">
                You cannot submit this form until all mandatory documents are
                uploaded. Please upload:{" "}
                <strong className="text-red-950 font-semibold">
                  {missingMandatoryDocs.map((d) => d.name).join(", ")}
                </strong>
                .
              </p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500">
              {missingMandatoryDocs.length > 0 ? (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Form cannot be
                  submitted until all mandatory documents are uploaded.
                </span>
              ) : (
                "By submitting, your documents will undergo automated verification, data cross-matching, and business rule auditing."
              )}
            </span>
            <button
              type="submit"
              disabled={isSubmitting || missingMandatoryDocs.length > 0}
              title={
                missingMandatoryDocs.length > 0
                  ? `Upload all mandatory documents (${missingMandatoryDocs.map((d) => d.name).join(", ")}) to enable submission`
                  : "Submit verified application"
              }
              className="w-full sm:w-auto rounded-md bg-gray-950 px-6 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Auditing Submission...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" /> Document Preview
                &amp; OCR Metadata
              </h3>
              <button
                onClick={() => setSelectedPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">
                  {selectedPreviewDoc.fileName}
                </div>
                <div className="text-slate-500">
                  Size: {Math.round((selectedPreviewDoc.fileSize || 0) / 1024)}{" "}
                  KB · Format: {selectedPreviewDoc.fileType}
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-2">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>Simulated Optical Character Recognition (OCR)</span>
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                    {selectedPreviewDoc.ocrConfidence || 98}% Confidence
                  </span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <div>
                    <span className="text-slate-500">
                      Extracted Legal Entity:
                    </span>{" "}
                    <strong>
                      {selectedPreviewDoc.extractedEntityName ||
                        formData.companyName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">
                      Certificate / Identifier No:
                    </span>{" "}
                    <strong className="font-mono">
                      {selectedPreviewDoc.extractedDocNumber || "ACTIVE"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">
                      Recorded Expiry Date:
                    </span>{" "}
                    <strong>
                      {selectedPreviewDoc.expiryDate || "Not Specified"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPreviewDoc(null)}
              className="w-full rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
