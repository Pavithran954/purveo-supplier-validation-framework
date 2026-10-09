"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SupplierSubmission, RegistrationTemplate, ValidationCheckItem } from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { initialTemplates, initialSubmissions } from "@/src/data/mock";
import { evaluateSupplierSubmission, ValidationReport, isFuzzyMatch } from "@/src/lib/validation";
import { getCountryNorm, isLifetimeDocument } from "@/src/lib/country-norms";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  FileText,
  Database,
  Check,
  Tag,
  FileCheck,
  Package,
} from "lucide-react";

export default function SupplierResultPage() {
  const params = useParams();
  const submissionId = params.id as string;
  const router = useRouter();

  const [submission, setSubmission] = useState<SupplierSubmission | null>(null);
  const [template, setTemplate] = useState<RegistrationTemplate | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [adminActionStatus, setAdminActionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;
    const subs = storage.get<SupplierSubmission[]>(STORAGE_KEYS.submissions, initialSubmissions);
    const foundSub = subs.find((s) => s.id === submissionId);
    if (foundSub) {
      setSubmission(foundSub);
      const tpls = storage.get<RegistrationTemplate[]>(STORAGE_KEYS.templates, initialTemplates);
      const foundTpl = tpls.find((t) => t.id === foundSub.templateId) || initialTemplates[0];
      setTemplate(foundTpl);

      const computed = evaluateSupplierSubmission(foundTpl, foundSub);
      setReport(computed);
    }
  }, [submissionId]);

  const handleAdminOverride = (overrideStatus: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED') => {
    if (!submission) return;
    const subs = storage.get<SupplierSubmission[]>(STORAGE_KEYS.submissions, initialSubmissions);
    const updated = subs.map((s) => {
      if (s.id === submission.id) {
        return {
          ...s,
          validationStatus: overrideStatus,
          adminOverrideStatus: overrideStatus,
        };
      }
      return s;
    });
    storage.set(STORAGE_KEYS.submissions, updated);
    setSubmission((prev) => (prev ? { ...prev, validationStatus: overrideStatus } : null));
    setAdminActionStatus(`Status updated to ${overrideStatus}.`);
    setTimeout(() => setAdminActionStatus(null), 3000);
  };

  if (!submission || !template || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-lg border border-gray-200 text-center space-y-4">
        <h2 className="text-base font-bold text-gray-950">Record Not Found</h2>
        <p className="text-xs text-gray-500">
          No submission record exists with ID <span className="font-mono">{submissionId}</span>.
        </p>
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Submissions</span>
        </Link>
      </div>
    );
  }

  const { score, status, checks, passedCount, failedCount, warningCount, summaryTable, externalRegistry } = report;
  const currentStatus = submission.validationStatus || status;
  const countryNorm = getCountryNorm(submission.data?.country);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <button
            onClick={() => router.push("/suppliers")}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-1 font-medium"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            <span>Back to Submissions</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-950">
            Validation Result: {submission.data?.companyName || "Supplier Application"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Program: <strong>{template.title}</strong> · Submitted on{" "}
            {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
              currentStatus === "APPROVED"
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : currentStatus === "REVIEW_REQUIRED"
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-red-100 text-red-900 border border-red-300"
            }`}
          >
            {currentStatus}
          </span>
        </div>
      </header>

      {adminActionStatus && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-gray-100 text-gray-900 rounded-md text-xs font-medium border border-gray-200 flex items-center gap-2"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{adminActionStatus}</span>
        </div>
      )}

      {/* Benchmark Validation Result Table (Assignment Page 5 & 6) */}
      <section aria-labelledby="scorecard-heading" className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="scorecard-heading" className="text-sm font-bold text-gray-950">
              Supplier Validation Table
            </h2>
            <p className="text-xs text-gray-500">
              Standardized compliance outcome matrix matching assignment specifications.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Score:</span>
            <span className="text-xl font-black text-gray-950">{score}/100</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 w-1/2">Validation Category</th>
                <th scope="col" className="px-6 py-3 w-1/2">Result Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">Company information</td>
                <td className="px-6 py-3.5">
                  {summaryTable.companyInfo === "Passed" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-800">
                      <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" /> ✗ Incomplete
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">
                  {countryNorm.code === "IN" ? "GST" : (countryNorm.taxLabel.split('(')[0].trim() || "Tax Identifier")}
                </td>
                <td className="px-6 py-3.5">
                  {summaryTable.gst === "Verified" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> {summaryTable.gst}
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">
                  {countryNorm.code === "IN" ? "PAN" : (countryNorm.secondaryTaxLabel?.split('(')[0].trim() || "Secondary Legal Identifier")}
                </td>
                <td className="px-6 py-3.5">
                  {summaryTable.pan === "Verified" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> {summaryTable.pan}
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">Bank details</td>
                <td className="px-6 py-3.5">
                  {summaryTable.bankDetails === "Verified" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> {summaryTable.bankDetails}
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">Documents</td>
                <td className="px-6 py-3.5">
                  {summaryTable.documents === "One document expiring" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> ⚠ One document expiring
                    </span>
                  ) : summaryTable.documents === "Document expired" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" /> ✗ Document expired
                    </span>
                  ) : summaryTable.documents === "All valid" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ All valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-800">
                      <XCircle className="h-3.5 w-3.5 text-red-600" aria-hidden="true" /> ✗ Missing required
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="px-6 py-3.5 font-medium text-gray-900">Company name matching</td>
                <td className="px-6 py-3.5">
                  {summaryTable.companyNameMatching === "Passed" ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" /> ✓ Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> ⚠ Possible mismatch / review required
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Administrator Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-gray-600">
            <span><strong>Passed:</strong> {passedCount}</span>
            <span><strong>Review:</strong> {warningCount}</span>
            <span><strong>Failed:</strong> {failedCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Override Decision:</span>
            <button
              onClick={() => handleAdminOverride("APPROVED")}
              className="rounded bg-gray-950 px-2.5 py-1 text-xs font-semibold text-white hover:bg-gray-800"
            >
              Approve
            </button>
            <button
              onClick={() => handleAdminOverride("REVIEW_REQUIRED")}
              className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
            >
              Flag Review
            </button>
            <button
              onClick={() => handleAdminOverride("REJECTED")}
              className="rounded border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              Reject
            </button>
          </div>
        </div>
      </section>

      {/* Submitted Application Information & Custom Fields Data */}
      <section aria-labelledby="submitted-info-heading" className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <h2 id="submitted-info-heading" className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
            <span>Submitted Profile &amp; Custom Fields Information</span>
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            <Tag className="h-3 w-3" aria-hidden="true" />
            Sector: {submission.data?.category || "Not Specified"}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">Company Legal Name</span>
            <strong className="text-gray-900 mt-0.5 block">{submission.data?.companyName || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">Corporate Email</span>
            <strong className="text-gray-900 mt-0.5 block">{submission.data?.email || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">Contact Person</span>
            <strong className="text-gray-900 mt-0.5 block">{submission.data?.contactPerson || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">Country</span>
            <strong className="text-gray-900 mt-0.5 block">{submission.data?.country || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">Annual Turnover</span>
            <strong className="text-gray-900 mt-0.5 block">
              {submission.data?.annualTurnover ? `${countryNorm.currencySymbol}${Number(submission.data.annualTurnover).toLocaleString(countryNorm.currency === 'INR' ? 'en-IN' : 'en-US')}` : "—"}
            </strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">{countryNorm.taxLabel}</span>
            <strong className="text-gray-900 mt-0.5 font-mono block">{submission.data?.gstNumber || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 block text-[11px]">{countryNorm.secondaryTaxLabel || "Secondary Legal ID"}</span>
              {countryNorm.secondaryTaxIsLifetime && (
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 rounded">
                  Lifetime
                </span>
              )}
            </div>
            <strong className="text-gray-900 mt-0.5 font-mono block">{submission.data?.panNumber || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">{countryNorm.bankAccountLabel || "Bank Account"}</span>
            <strong className="text-gray-900 mt-0.5 font-mono block">{submission.data?.bankAccount || "—"}</strong>
          </div>
          <div className="p-3 bg-gray-50 rounded border border-gray-100">
            <span className="text-gray-400 block text-[11px]">{countryNorm.bankRoutingLabel}</span>
            <strong className="text-gray-900 mt-0.5 font-mono block">{submission.data?.ifscCode || "—"}</strong>
          </div>
        </div>

        {/* Supplying Item & Commercial Scope */}
        {submission.data?.items?.some((item: { itemName?: string }) => item.itemName) ? (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
              <span>Supplying Items &amp; Material Specifications</span>
            </h3>
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Product Type:</span>{" "}
              {submission.data?.productType || "Not provided"}
            </p>
            <div className="space-y-2 text-xs">
              {submission.data.items
                .filter((item: { itemName?: string }) => item.itemName)
                .map((item: {
                  id: string;
                  itemName: string;
                  unitOfMeasurement?: string;
                  unitPrice?: number | string;
                }) => (
                  <div key={item.id} className="grid gap-3 rounded border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3">
                    <strong className="text-gray-900 sm:col-span-2">{item.itemName}</strong>
                    <strong className="font-mono text-gray-900">
                      {countryNorm.currencySymbol}{Number(item.unitPrice || 0).toLocaleString()} / {item.unitOfMeasurement || "Units"}
                    </strong>
                  </div>
                ))}
            </div>
          </div>
        ) : submission.data?.supplyingItemName ? (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Supplying Item &amp; Material Specifications
            </h3>
            <strong className="text-gray-900">{submission.data.supplyingItemName}</strong>
          </div>
        ) : null}

        {/* Dynamic Custom Fields Responses */}
        {template.customFields && template.customFields.length > 0 && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Custom Field Responses ({template.customFields.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {template.customFields.map((cf) => {
                const responseVal = submission.data?.[cf.id];
                const displayVal =
                  cf.type === "boolean"
                    ? (String(responseVal) === "true" ? "Yes / Confirmed" : "No / Unconfirmed")
                    : (responseVal !== undefined && responseVal !== null && String(responseVal).trim() !== ""
                      ? String(responseVal)
                      : "—");

                return (
                  <div key={cf.id} className="p-3 bg-gray-50 rounded border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-[11px]">{cf.label}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                        {cf.type}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-950 text-xs">
                      {displayVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Uploaded Documents & Cross-Document Verification */}
      {submission.documentsUploaded && submission.documentsUploaded.length > 0 && (
        <section aria-labelledby="documents-heading" className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 id="documents-heading" className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
              <span>Uploaded Documents &amp; Identity Cross-Matching ({submission.documentsUploaded.length})</span>
            </h2>
            <span className="text-[11px] text-gray-500">
              Document verification &amp; entity name cross-check
            </span>
          </div>

          <div className="grid gap-2.5">
            {submission.documentsUploaded.map((doc, idx) => {
              const isLifetime = Boolean(doc.isLifetime || isLifetimeDocument(doc.docId, doc.fileName));
              const extractedName = doc.extractedEntityName || submission.data?.[`doc_name_${doc.docId}`];
              const extractedDocNum = doc.extractedDocNumber || submission.data?.[`doc_num_${doc.docId}`];
              const registeredName = submission.data?.companyName || "";
              const hasNameMatch = extractedName && registeredName ? isFuzzyMatch(extractedName, registeredName) : null;

              return (
                <div key={`${doc.docId}-${idx}`} className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
                      <span className="font-semibold text-gray-950">{doc.fileName}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                        {doc.docId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.expiryDate && !isLifetime ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                          doc.isExpired
                            ? "bg-red-50 text-red-800 border-red-200"
                            : doc.isExpiringSoon
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                          Valid Thru: {doc.expiryDate}
                          {doc.isExpired && " (EXPIRED)"}
                          {doc.isExpiringSoon && " (EXPIRING SOON)"}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium">Verified File</span>
                      )}
                    </div>
                  </div>

                  {(extractedName || extractedDocNum) && (
                    <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-[11px]">
                      <div>
                        <span className="text-gray-500">Document Entity Name: </span>
                        <strong className="text-gray-900">{extractedName || "—"}</strong>
                        {hasNameMatch !== null && (
                          <span className={`ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                            hasNameMatch ? "text-emerald-700" : "text-amber-700"
                          }`}>
                            {hasNameMatch ? "✓ Matches Profile" : "⚠ Discrepancy Flagged"}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Document Identifier No: </span>
                        <strong className="text-gray-900 font-mono">{extractedDocNum || "—"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Simulated Authoritative External Registry Query (Page 4) */}
      {externalRegistry && (
        <section aria-labelledby="registry-heading" className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 id="registry-heading" className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
              <span>Simulated External Registry Check ({countryNorm.registryAuthorityShort})</span>
            </h2>
            <span className="text-[11px] font-mono text-gray-500">
              Taxpayer: {externalRegistry.taxpayerType}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-gray-500 block text-[11px]">{countryNorm.taxLabel.split('(')[0].trim()} Entity</span>
              <strong className="text-gray-900 mt-0.5 block">{externalRegistry.legalName}</strong>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-gray-500 block text-[11px]">Tax Filing Status</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                <strong className="text-emerald-900">{externalRegistry.status}</strong>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-gray-500 block text-[11px]">Jurisdiction</span>
              <strong className="text-gray-900 mt-0.5 block">{externalRegistry.stateJurisdiction}</strong>
            </div>
          </div>
        </section>
      )}

      {/* Detailed Check-by-Check Audit List */}
      <section aria-labelledby="audit-heading" className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        <h2 id="audit-heading" className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-100 pb-2">
          Rule-by-Rule Audit Breakdown ({checks.length} Rules Evaluated)
        </h2>

        <div className="divide-y divide-gray-100">
          {checks.map((chk: ValidationCheckItem) => (
            <div key={chk.id} className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-950">{chk.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                    {chk.category.replace("_", " ")}
                  </span>
                </div>
                <p className="text-gray-600">{chk.message}</p>
                {chk.details && <p className="text-[11px] text-gray-400">{chk.details}</p>}
              </div>

              <div className="shrink-0">
                {chk.status === "PASSED" && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" aria-hidden="true" /> PASSED
                  </span>
                )}
                {chk.status === "WARNING" && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertTriangle className="h-3 w-3 text-amber-600" aria-hidden="true" /> REVIEW
                  </span>
                )}
                {chk.status === "FAILED" && (
                  <span className="inline-flex items-center gap-1 font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <XCircle className="h-3 w-3 text-red-600" aria-hidden="true" /> FAILED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
