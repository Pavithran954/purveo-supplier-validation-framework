"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SupplierSubmission, RegistrationTemplate } from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { initialTemplates, initialSubmissions } from "@/src/data/mock";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function ValidationPage() {
  const [submissions, setSubmissions] = useState<SupplierSubmission[]>([]);
  const [templates, setTemplates] = useState<RegistrationTemplate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const subs = storage.get<SupplierSubmission[]>(STORAGE_KEYS.submissions, initialSubmissions);
    const tpls = storage.get<RegistrationTemplate[]>(STORAGE_KEYS.templates, initialTemplates);
    setSubmissions(subs);
    setTemplates(tpls);
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === "ALL") return true;
    return sub.validationStatus === statusFilter;
  });

  const approvedCount = submissions.filter((s) => s.validationStatus === "APPROVED").length;
  const reviewCount = submissions.filter((s) => s.validationStatus === "REVIEW_REQUIRED").length;
  const rejectedCount = submissions.filter((s) => s.validationStatus === "REJECTED").length;
  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, curr) => acc + (curr.validationScore || 0), 0) /
            submissions.length
        )
      : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
          Validation Engine Overview
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Automated compliance scoring, threshold enforcement, and audit decision matrices.
        </p>
      </header>

      {/* Aggregate KPI Grid */}
      <section aria-labelledby="val-metrics-heading">
        <h2 id="val-metrics-heading" className="sr-only">Validation Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Average Score</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{avgScore}/100</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Across all submissions</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Approved</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{approvedCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Meets all requirements</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Review Required</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{reviewCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Requires staff review</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold uppercase">Rejected</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{rejectedCount}</div>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Critical failures</span>
          </div>
        </div>
      </section>

      {/* Evaluated Queue Table Section */}
      <section aria-labelledby="queue-heading" className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <h2 id="queue-heading" className="text-sm font-bold text-gray-950">
            Evaluated Submissions Queue
          </h2>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <select
              aria-label="Filter evaluated submissions by status outcome"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded border border-gray-200 bg-gray-50 px-2 py-1 font-medium text-gray-800"
            >
              <option value="ALL">All Outcomes ({submissions.length})</option>
              <option value="APPROVED">Approved ({approvedCount})</option>
              <option value="REVIEW_REQUIRED">Review Required ({reviewCount})</option>
              <option value="REJECTED">Rejected ({rejectedCount})</option>
            </select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No submissions matching filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSubmissions.map((sub) => {
              const company = sub.data?.companyName || "Unknown";
              const templateTitle =
                templates.find((t) => t.id === sub.templateId)?.title || sub.templateId;

              return (
                <div
                  key={sub.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 px-2 rounded transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-950 text-xs">{company}</span>
                      <span className="text-[11px] text-gray-400 font-mono">({sub.id})</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Program: <span className="text-gray-700 font-medium">{templateTitle}</span> ·
                      Category: <span className="text-gray-700 font-medium">{sub.data?.category || "—"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-950">
                        {sub.validationScore ?? 0}/100
                      </div>
                      <span
                        className={`inline-block text-[10px] font-bold uppercase ${
                          sub.validationStatus === "APPROVED"
                            ? "text-emerald-800"
                            : sub.validationStatus === "REVIEW_REQUIRED"
                            ? "text-amber-800"
                            : "text-red-800"
                        }`}
                      >
                        {sub.validationStatus}
                      </span>
                    </div>

                    <Link
                      href={`/suppliers/${sub.id}/result`}
                      className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <span>Audit Table</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
