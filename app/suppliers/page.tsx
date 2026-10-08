"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SupplierSubmission,
  HybridRequest,
  RegistrationTemplate,
} from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { getCountryNorm } from "@/src/lib/country-norms";
import {
  initialTemplates,
  initialSubmissions,
  initialHybridRequests,
} from "@/src/data/mock";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  FileText,
  UserCheck,
  Building2,
  Key,
  Filter,
  Search,
  AlertTriangle,
  Trash2,
  ChevronRight,
  Info,
} from "lucide-react";

export default function SuppliersPage() {
  const [submissions, setSubmissions] = useState<SupplierSubmission[]>([]);
  const [hybridRequests, setHybridRequests] = useState<HybridRequest[]>([]);
  const [templates, setTemplates] = useState<RegistrationTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"submissions" | "hybrid_requests">(
    "submissions",
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const subs = storage.get<SupplierSubmission[]>(
      STORAGE_KEYS.submissions,
      initialSubmissions,
    );
    const hyb = storage.get<HybridRequest[]>(
      STORAGE_KEYS.hybridRequests,
      initialHybridRequests,
    );
    const tpls = storage.get<RegistrationTemplate[]>(
      STORAGE_KEYS.templates,
      initialTemplates,
    );
    setSubmissions(subs);
    setHybridRequests(hyb);
    setTemplates(tpls);
  }, []);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDeleteSubmission = (id: string, companyName: string) => {
    if (
      !window.confirm(
        `Permanently delete the submission from "${companyName}"? This action cannot be undone.`,
      )
    )
      return;
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    storage.set(STORAGE_KEYS.submissions, updated);
    showStatus("success", `Submission from "${companyName}" has been deleted.`);
  };

  const handleUpdateHybridStatus = (
    id: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    const updated = hybridRequests.map((req) =>
      req.id === id ? { ...req, status: newStatus } : req,
    );
    setHybridRequests(updated);
    storage.set(STORAGE_KEYS.hybridRequests, updated);
    showStatus(
      "success",
      newStatus === "APPROVED"
        ? "Applicant approved. Onboarding token is now active."
        : "Application rejected.",
    );
  };

  const handleDeleteHybridRequest = (id: string, companyName: string) => {
    if (
      !window.confirm(
        `Permanently delete the screening request from "${companyName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const updated = hybridRequests.filter((request) => request.id !== id);
    setHybridRequests(updated);
    storage.set(STORAGE_KEYS.hybridRequests, updated);
    showStatus(
      "success",
      `Screening request from "${companyName}" has been deleted.`,
    );
  };

  const getTemplateTitle = (templateId: string) =>
    templates.find((t) => t.id === templateId)?.title || templateId;

  const getRegistrationType = (submission: SupplierSubmission) => {
    const configuredType = templates.find(
      (template) => template.id === submission.templateId,
    )?.type;
    const type = configuredType || submission.data?.regType;

    if (typeof type !== "string") return "—";

    const normalizedType = type.toUpperCase();
    if (normalizedType === "OPEN") return "Open";
    if (normalizedType === "CLOSED") return "Closed";
    if (normalizedType === "HYBRID") return "Hybrid";
    return type;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (sub.validationStatus === "APPROVED") return false;
    const company = (sub.data?.companyName || "").toLowerCase();
    const id = (sub.id || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = company.includes(query) || id.includes(query);
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && sub.validationStatus === statusFilter;
  });

  const pendingCount = hybridRequests.filter(
    (r) => r.status === "PENDING",
  ).length;

  const statusBadge = (status: string) => {
    if (status === "APPROVED")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Approved
        </span>
      );
    if (status === "REVIEW_REQUIRED")
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Review
          Required
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
        <XCircle className="h-3 w-3" aria-hidden="true" /> Rejected
      </span>
    );
  };

  const scoreBar = (score: number) => {
    const color =
      score >= 75
        ? "bg-emerald-500"
        : score >= 50
          ? "bg-amber-400"
          : "bg-red-400";
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 text-sm w-10">{score}</span>
        <div
          className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`h-full ${color} rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-950">
            Supplier Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review submissions, compliance scores, and manage hybrid screening
            requests.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Total Submissions
            </div>
            <div className="text-2xl font-black text-gray-950">
              {submissions.length}
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Pending Screening
            </div>
            <div className="text-2xl font-black text-gray-950">
              {pendingCount}
            </div>
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div
          className="flex border-b border-gray-200"
          role="tablist"
          aria-label="Supplier management sections"
        >
          <button
            role="tab"
            aria-selected={activeTab === "submissions"}
            onClick={() => setActiveTab("submissions")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 ${
              activeTab === "submissions"
                ? "border-gray-950 text-gray-950"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Submissions
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
              {submissions.length}
            </span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "hybrid_requests"}
            onClick={() => setActiveTab("hybrid_requests")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 ${
              activeTab === "hybrid_requests"
                ? "border-gray-950 text-gray-950"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            <UserCheck className="h-4 w-4" aria-hidden="true" />
            Hybrid Screening
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {pendingCount} pending
              </span>
            )}
          </button>
        </div>

        {/* ─── SUBMISSIONS TAB ─── */}
        {activeTab === "submissions" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative flex-1 max-w-xs">
                <Search
                  className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search supplier name or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search supplier submissions"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter
                  className="h-3.5 w-3.5 text-gray-400 shrink-0"
                  aria-hidden="true"
                />
                <label
                  htmlFor="status-filter"
                  className="text-xs text-gray-500 sr-only"
                >
                  Filter by outcome
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 focus-visible:outline-2 focus-visible:outline-gray-900"
                >
                  <option value="ALL">
                    All outcomes ({submissions.length})
                  </option>
                  <option value="APPROVED">Approved</option>
                  <option value="REVIEW_REQUIRED">Review Required</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-20">
                <Building2
                  className="h-8 w-8 text-gray-200 mx-auto mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-gray-700">
                  No submissions found
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Try adjusting your search or filter."
                    : "Submissions will appear here once suppliers complete registration forms."}
                </p>
              </div>
            ) : (
              <div
                className="overflow-x-auto"
                role="region"
                aria-label="Supplier submissions table"
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th
                        scope="col"
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Supplier
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Program
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Sector
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Score /100
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Outcome
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        Submitted
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-right"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubmissions.map((sub) => {
                      const companyName =
                        sub.data?.companyName || "Unknown Entity";
                      const category = sub.data?.category || "—";
                      const score = sub.validationScore ?? 0;
                      const status = sub.validationStatus || "REVIEW_REQUIRED";
                      const minimumPrice = Number(
                        sub.data?.unitPriceMin ?? sub.data?.unitPrice ?? 0,
                      );
                      const maximumPrice = Number(sub.data?.unitPriceMax ?? minimumPrice);
                      const averagePrice =
                        minimumPrice || maximumPrice
                          ? (minimumPrice + maximumPrice) / 2
                          : null;
                      const currency = getCountryNorm(sub.data?.country).currencySymbol;

                      return (
                        <tr
                          key={sub.id}
                          className="group hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-gray-900 text-sm leading-tight">
                              {companyName}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              ID: <span className="font-medium">{sub.id}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Reg Type:{" "}
                              <span className="uppercase font-medium">
                                {getRegistrationType(sub)}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Supplying:{" "}
                              <span className="font-medium uppercase">
                                {String(
                                  sub.data?.supplyingItemName ||
                                    sub.data?.supplyingProducts ||
                                    "Nil",
                                )}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Average Unit Price:{" "}
                              <span className="font-medium text-gray-600">
                                {averagePrice === null
                                  ? "Nil"
                                  : `${currency}${averagePrice.toLocaleString()}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs text-gray-600 font-medium max-w-[160px] block truncate">
                              {getTemplateTitle(sub.templateId)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs text-gray-600 font-medium">
                              {category}
                            </span>
                          </td>
                          <td className="px-4 py-4 min-w-[120px]">
                            {scoreBar(score)}
                          </td>
                          <td className="px-4 py-4">{statusBadge(status)}</td>
                          <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">
                            {new Date(sub.submittedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/suppliers/${sub.id}/result`}
                                aria-label={`View audit result for ${companyName}`}
                                className="inline-flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition focus-visible:outline-2 focus-visible:outline-gray-900"
                              >
                                <ShieldCheck
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                View Audit
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeleteSubmission(sub.id, companyName)
                                }
                                aria-label={`Delete submission from ${companyName}`}
                                title="Delete submission"
                                className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 hover:border-red-300 transition focus-visible:outline-2 focus-visible:outline-red-700"
                              >
                                <Trash2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400">
                  Showing {filteredSubmissions.length} of {submissions.length}{" "}
                  submission{submissions.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── HYBRID SCREENING TAB ─── */}
        {activeTab === "hybrid_requests" && (
          <div>
            <div className="flex items-start gap-2.5 px-5 py-4 border-b border-gray-100 bg-gray-50/40">
              <Info
                className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                Suppliers using Hybrid registration first submit an interest
                form. Approving an applicant issues a secure onboarding token
                that unlocks the full compliance form.
              </p>
            </div>

            {hybridRequests.length === 0 ? (
              <div className="text-center py-20">
                <UserCheck
                  className="h-8 w-8 text-gray-200 mx-auto mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-gray-700">
                  No screening requests yet
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Applications will appear here when suppliers register via a
                  Hybrid program link.
                </p>
              </div>
            ) : (
              <ul
                className="divide-y divide-gray-100"
                aria-label="Hybrid screening applications"
              >
                {hybridRequests.map((req) => (
                  <li
                    key={req.id}
                    className="px-5 py-5 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Applicant info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {req.companyName}
                          </span>
                          {req.status === "APPROVED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2
                                className="h-2.5 w-2.5"
                                aria-hidden="true"
                              />{" "}
                              Approved
                            </span>
                          )}
                          {req.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock
                                className="h-2.5 w-2.5"
                                aria-hidden="true"
                              />{" "}
                              Pending Review
                            </span>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                              <XCircle
                                className="h-2.5 w-2.5"
                                aria-hidden="true"
                              />{" "}
                              Rejected
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                          <span>
                            <span className="text-gray-400">Email</span>{" "}
                            <strong className="text-gray-700 font-medium">
                              {req.email}
                            </strong>
                          </span>
                          <span>
                            <span className="text-gray-400">Category</span>{" "}
                            <strong className="text-gray-700 font-medium">
                              {req.category}
                            </strong>
                          </span>
                          <span>
                            <span className="text-gray-400">Program</span>{" "}
                            <strong className="text-gray-700 font-medium">
                              {getTemplateTitle(req.templateId)}
                            </strong>
                          </span>
                          <span>
                            <span className="text-gray-400">Submitted</span>{" "}
                            <strong className="text-gray-700 font-medium">
                              {new Date(req.submittedAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </strong>
                          </span>
                        </div>

                        <blockquote className="text-xs text-gray-600 italic bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1 max-w-xl">
                          "{req.aboutUs}"
                        </blockquote>

                        {req.status === "APPROVED" && (
                          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-1 max-w-xl">
                            <Key
                              className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-medium">Form Link:</span>
                            <Link
                              href={`/supplier/${req.templateId}/register?token=${req.id}`}
                              target="_blank"
                              className="underline font-mono text-[11px] font-bold text-emerald-900 truncate hover:no-underline"
                              aria-label={`Open onboarding form for ${req.companyName}`}
                            >
                              /supplier/{req.templateId}/register?token={req.id}
                            </Link>
                            <ChevronRight
                              className="h-3 w-3 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-1">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateHybridStatus(req.id, "APPROVED")
                              }
                              className="rounded-md cursor-pointer bg-gray-950 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition focus-visible:outline-2 focus-visible:outline-gray-900"
                            >
                              Approve &amp; Issue Token
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateHybridStatus(req.id, "REJECTED")
                              }
                              className="rounded-md cursor-pointer border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition focus-visible:outline-2 focus-visible:outline-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <button
                            onClick={() =>
                              handleUpdateHybridStatus(req.id, "REJECTED")
                            }
                            className="rounded-md cursor-pointer border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition focus-visible:outline-2 focus-visible:outline-gray-900"
                          >
                            Revoke Approval
                          </button>
                        )}
                        {req.status === "REJECTED" && (
                          <button
                            onClick={() =>
                              handleUpdateHybridStatus(req.id, "APPROVED")
                            }
                            className="rounded-md cursor-pointer border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition focus-visible:outline-2 focus-visible:outline-gray-900"
                          >
                            Re-approve
                          </button>
                        )}
                        {(req.status === "APPROVED" ||
                          req.status === "REJECTED") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteHybridRequest(req.id, req.companyName)
                            }
                            aria-label={`Delete screening request from ${req.companyName}`}
                            className="rounded-md cursor-pointer border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-white hover:bg-red-600 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
