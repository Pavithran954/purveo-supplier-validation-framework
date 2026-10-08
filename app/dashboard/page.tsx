"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RegistrationTemplate,
  SupplierSubmission,
  HybridRequest,
} from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import {
  initialTemplates,
  initialSubmissions,
  initialHybridRequests,
} from "@/src/data/mock";
import {
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ExternalLink,
  RotateCcw,
  Building2,
  Lock,
  GitBranch,
} from "lucide-react";

export default function DashboardPage() {
  const [templates, setTemplates] = useState<RegistrationTemplate[]>([]);
  const [submissions, setSubmissions] = useState<SupplierSubmission[]>([]);
  const [hybridRequests, setHybridRequests] = useState<HybridRequest[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    const tpls = storage.get<RegistrationTemplate[]>(
      STORAGE_KEYS.templates,
      initialTemplates,
    );
    const subs = storage.get<SupplierSubmission[]>(
      STORAGE_KEYS.submissions,
      initialSubmissions,
    );
    const hybs = storage.get<HybridRequest[]>(
      STORAGE_KEYS.hybridRequests,
      initialHybridRequests,
    );

    setTemplates(tpls);
    setSubmissions(subs);
    setHybridRequests(hybs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = () => {
    storage.set(STORAGE_KEYS.templates, initialTemplates);
    storage.set(STORAGE_KEYS.submissions, initialSubmissions);
    storage.set(STORAGE_KEYS.hybridRequests, initialHybridRequests);
    loadData();
    setFeedback("Sample dataset restored.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const approvedCount = submissions.filter(
    (s) => s.validationStatus === "APPROVED",
  ).length;
  const reviewCount = submissions.filter(
    (s) => s.validationStatus === "REVIEW_REQUIRED",
  ).length;
  const pendingScreenings = hybridRequests.filter(
    (h) => h.status === "PENDING",
  ).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Supplier Operations Overview
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage metadata-driven onboarding programs, review verification
            audits, and configure dynamic rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            aria-label="Reset to default mock dataset"
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-900 transition-colors"
          >
            <RotateCcw
              className="h-3.5 w-3.5 text-gray-500"
              aria-hidden="true"
            />
            <span>Reset Data</span>
          </button>
          <Link
            href="/registrations/new"
            className="flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-gray-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Registration</span>
          </Link>
        </div>
      </header>

      {/* Accessible Status Notification */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-gray-200 bg-gray-100 p-3 text-xs text-gray-800 font-medium"
        >
          {feedback}
        </div>
      )}

      {/* Primary KPI Metrics */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Active Forms</span>
              <FileText className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {templates.length}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Configured onboarding programs
            </span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Submissions</span>
              <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {submissions.length}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Submitted supplier records
            </span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Verified &amp; Approved</span>
              <CheckCircle2
                className="h-4 w-4 text-gray-700"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {approvedCount}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Satisfied all validation criteria
            </span>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Pending Review</span>
              <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-950">
              {reviewCount + pendingScreenings}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Requires staff attention
            </span>
          </div>
        </div>
      </section>

      {/* Registration Modes Test Navigation */}
      {/* <section aria-labelledby="modes-heading" className="space-y-3">
        <h2
          id="modes-heading"
          className="text-xs font-bold uppercase tracking-wider text-gray-500"
        >
          Registration Modes
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  Open Registration
                </span>
                <Building2
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-950 mt-2">
                Open Vendor Fast-Track
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Direct public registration link without whitelisting or
                pre-screening gates.
              </p>
            </div>
            <Link
              href="/supplier/tpl-open-fasttrack/register"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-gray-600"
            >
              <span>Test Open Portal</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  Closed Registration
                </span>
                <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-950 mt-2">
                Closed Tender Program
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Restricted access requiring pre-whitelisted corporate email
                verification.
              </p>
            </div>
            <Link
              href="/supplier/tpl-closed-strategic/register"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-gray-600"
            >
              <span>Test Closed Gate</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  Hybrid Registration
                </span>
                <GitBranch
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-950 mt-2">
                Global Strategic Partner
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Stage 1 pre-screening pitch &rarr; Admin approval &rarr; Formal
                token onboarding.
              </p>
            </div>
            <Link
              href="/supplier/tpl-global-supplier-2026/register"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-gray-600"
            >
              <span>Test Hybrid Portal</span>
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section> */}

      {/* Active Templates & Benchmark Cases Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Templates List */}
        <section
          aria-labelledby="templates-heading"
          className="bg-white p-5 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2
              id="templates-heading"
              className="text-sm font-bold text-gray-950"
            >
              Active Forms
            </h2>
            <Link
              href="/registrations"
              className="text-xs font-semibold text-gray-600 hover:text-gray-950"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center justify-between p-3 rounded-md border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-950">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-medium">
                      {tpl.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">
                    {tpl.customFields?.length || 0} custom fields ·{" "}
                    {tpl.documents?.length || 0} required docs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/supplier/${tpl.id}/register`}
                    target="_blank"
                    className="p-1 text-gray-400 hover:text-gray-900"
                    title="Open public portal"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href={`/registrations/${tpl.id}/configure`}
                    className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Update Form
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benchmark Submissions Case Studies */}
        <section
          aria-labelledby="audits-heading"
          className="bg-white p-5 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 id="audits-heading" className="text-sm font-bold text-gray-950">
              Recent Submissions &amp; Audits
            </h2>
            <Link
              href="/suppliers"
              className="text-xs font-semibold text-gray-600 hover:text-gray-950"
            >
              View all
            </Link>
          </div>

          <div className="space-y-2.5">
            {submissions.map((sub) => {
              const company = sub.data?.companyName || "Supplier";
              const score = sub.validationScore ?? 0;
              const status = sub.validationStatus || "REVIEW_REQUIRED";

              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-md border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-950">
                        {company}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : status === "REVIEW_REQUIRED"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">
                      Score:{" "}
                      <strong className="text-gray-900">{score}/100</strong> ·
                      Category: {sub.data?.category}
                    </span>
                  </div>

                  <Link
                    href={`/suppliers/${sub.id}/result`}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-gray-600"
                  >
                    <span>Audit Sheet</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
