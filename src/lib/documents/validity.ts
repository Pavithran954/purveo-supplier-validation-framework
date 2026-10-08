import type { DocumentRequirement, DocumentUploadItem } from "@/types/builder";

export type DocumentValidityStatus =
  | "NOT_UPLOADED"
  | "UPLOADED"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "OPTIONAL_NOT_PROVIDED"
  | "MISSING_EXPIRY_DATE";

export interface DocumentValidityResult {
  documentId: string;
  status: DocumentValidityStatus;
  penalty: number;
  blocking: boolean;
  message: string;
  daysRemaining?: number;
  daysExpired?: number;
}

function calendarDate(value: Date | string): number {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function evaluateDocumentValidity(
  requirement: DocumentRequirement,
  upload: DocumentUploadItem | undefined,
  today = new Date(),
): DocumentValidityResult {
  if (!upload) {
    return {
      documentId: requirement.id,
      status: requirement.required ? "NOT_UPLOADED" : "OPTIONAL_NOT_PROVIDED",
      penalty: 0,
      blocking: requirement.required,
      message: requirement.required ? "Required document is missing." : "Optional document not provided.",
    };
  }

  const validityType = requirement.validityType || (requirement.isLifetime ? "LIFETIME" : "TIME_BOUND");
  if (validityType === "LIFETIME") {
    return { documentId: requirement.id, status: "UPLOADED", penalty: 0, blocking: false, message: "Document uploaded." };
  }

  if (!upload.expiryDate) {
    return { documentId: requirement.id, status: "MISSING_EXPIRY_DATE", penalty: 0, blocking: requirement.required, message: "Expiration date is required." };
  }

  const difference = calendarDate(upload.expiryDate) - calendarDate(today);
  const daysRemaining = Math.round(difference / 86400000);
  if (daysRemaining < 0) {
    return { documentId: requirement.id, status: "EXPIRED", penalty: -25, blocking: true, daysExpired: Math.abs(daysRemaining), message: `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago.` };
  }
  if (daysRemaining <= 30) {
    return { documentId: requirement.id, status: "EXPIRING_SOON", penalty: -5, blocking: false, daysRemaining, message: daysRemaining === 0 ? "Expires today." : `Expiring in ${daysRemaining} days.` };
  }
  return { documentId: requirement.id, status: "ACTIVE", penalty: 0, blocking: false, daysRemaining, message: "Verified and valid." };
}

export function validateDocuments(
  requirements: DocumentRequirement[],
  uploads: DocumentUploadItem[],
  today = new Date(),
): DocumentValidityResult[] {
  return requirements.map((requirement) =>
    evaluateDocumentValidity(requirement, uploads.find((upload) => upload.docId === requirement.id), today),
  );
}

export function calculateDocumentPenalties(results: DocumentValidityResult[]): number {
  return Math.max(-100, results.reduce((total, result) => total + result.penalty, 0));
}
