import type { RegistrationStatus, SupplierStatus, ValidationStatus } from "@/src/types";

type Status = RegistrationStatus | SupplierStatus | ValidationStatus;

const styles: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700",
  passed: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-slate-100 text-slate-600",
  archived: "bg-slate-100 text-slate-600",
  closed: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-700",
  warning: "bg-amber-50 text-amber-700",
  review_required: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
