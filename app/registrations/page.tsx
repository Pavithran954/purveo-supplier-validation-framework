"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RegistrationTemplate } from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { initialTemplates } from "@/src/data/mock";
import {
  Plus,
  ExternalLink,
  Settings,
  Trash2,
  Calendar,
  Copy,
  Check,
} from "lucide-react";

export default function RegistrationsPage() {
  const [templates, setTemplates] = useState<RegistrationTemplate[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const list = storage.get<RegistrationTemplate[]>(
      STORAGE_KEYS.templates,
      initialTemplates,
    );
    setTemplates(list);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      storage.set(STORAGE_KEYS.templates, updated);
    }
  };

  const copyRegistrationLink = (templateId: string) => {
    const url = `${window.location.origin}/supplier/${templateId}/register`;
    navigator.clipboard.writeText(url);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
            Registrations
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Configure Open, Closed, or Hybrid onboarding pipelines with custom
            fields and document triggers.
          </p>
        </div>
        <Link
          href="/registrations/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-gray-900 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>New Registration</span>
        </Link>
      </header>

      {/* Grid of Templates */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                  {tpl.type} MODE
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span>
                    {tpl.validity.startDate} to {tpl.validity.endDate}
                  </span>
                </span>
              </div>

              <h2 className="text-base font-bold text-gray-950">{tpl.title}</h2>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                ID: {tpl.id}
              </p>
              {tpl.description && (
                <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                  {tpl.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 border-y border-gray-100 py-2.5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Standard
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {Object.values(tpl.basicFields).filter(Boolean).length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Custom
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {tpl.customFields?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Docs
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {tpl.documents?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
              <button
                onClick={() => copyRegistrationLink(tpl.id)}
                className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-950 p-1"
              >
                {copiedId === tpl.id ? (
                  <>
                    <Check
                      className="h-3 w-3 text-emerald-700"
                      aria-hidden="true"
                    />
                    <span className="text-emerald-700 font-semibold">
                      Link Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    <span>Copy Portal Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/supplier/${tpl.id}/register`}
                  target="_blank"
                  className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  <span>Portal</span>
                </Link>
                <Link
                  href={`/registrations/${tpl.id}/configure`}
                  className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-3 w-3" aria-hidden="true" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  aria-label={`Delete ${tpl.title}`}
                  className="p-1 text-gray-400 hover:text-red-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
