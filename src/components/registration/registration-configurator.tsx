"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RegistrationTemplate,
  RegistrationType,
  DynamicField,
  DocumentRequirement,
  FieldType,
} from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { initialTemplates, initialCategories } from "@/src/data/mock";
import {
  CATEGORY_DOCUMENTS,
  COMMON_DOCUMENTS,
  DOCUMENT_CATEGORIES,
} from "@/src/data/documents";
import {
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  Eye,
  SlidersHorizontal,
  Mail,
} from "lucide-react";

interface Props {
  templateId?: string;
}

const emptyCustomField: DynamicField = {
  id: "",
  label: "",
  type: "text",
  placeholder: "",
  required: false,
};

const emptyDoc: DocumentRequirement = {
  id: "",
  name: "",
  categoryTrigger: "ALL",
  required: true,
};

export function RegistrationConfigurator({ templateId }: Props) {
  const router = useRouter();
  const [template, setTemplate] = useState<RegistrationTemplate>(() => ({
    id: `tpl-${Date.now().toString(36)}`,
    title: "",
    type: "OPEN",
    validity: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    invitedEmails: [],
    basicFields: {
      companyName: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      country: true,
      category: true,
      annualTurnover: false,
      expectedPurchaseValue: false,
      productsServices: true,
      companySize: false,
      bankDetails: false,
      taxDetails: true,
      supplyingItem: true,
    },
    customFields: [],
    documents: [],
    createdAt: new Date().toISOString(),
  }));

  const [invitedEmailInput, setInvitedEmailInput] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<"basics" | "custom_fields" | "documents" | "preview">("basics");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load existing if editing & load categories
  useEffect(() => {
    const cats = storage.get<string[]>(STORAGE_KEYS.categories, initialCategories);
    setAvailableCategories(cats);

    if (!templateId) return;
    const existingList = storage.get<RegistrationTemplate[]>(STORAGE_KEYS.templates, initialTemplates);
    const found = existingList.find((t) => t.id === templateId);
    if (found) {
      const mergedBasic = Object.assign(
        {
          companyName: true,
          contactPerson: true,
          email: true,
          phone: true,
          address: true,
          country: true,
          category: true,
          annualTurnover: false,
          expectedPurchaseValue: false,
          productsServices: true,
          companySize: false,
          bankDetails: false,
          taxDetails: true,
          supplyingItem: true,
        },
        found.basicFields || {},
      );
      setTemplate({
        ...found,
        basicFields: mergedBasic,
        documentOverrides: found.documentOverrides || {},
        customCategoryDocuments: found.customCategoryDocuments || [],
      });
      if (found.invitedEmails) {
        setInvitedEmailInput(found.invitedEmails.join(", "));
      }
    }
  }, [templateId]);

  const handleSave = () => {
    if (!template.title.trim()) {
      setErrorMessage("Please enter a form title.");
      return;
    }
    if (!template.validity.startDate || !template.validity.endDate) {
      setErrorMessage("Validity dates are required.");
      return;
    }

    const invitedEmailsArray = invitedEmailInput
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    const toSave: RegistrationTemplate = {
      ...template,
      invitedEmails: invitedEmailsArray,
    };

    const existingList = storage.get<RegistrationTemplate[]>(STORAGE_KEYS.templates, initialTemplates);
    const filtered = existingList.filter((t) => t.id !== toSave.id);
    const updated = [toSave, ...filtered];
    storage.set(STORAGE_KEYS.templates, updated);

    setErrorMessage("");
    setSaveSuccess(true);
    setTimeout(() => {
      router.push(`/registrations`);
    }, 1200);
  };

  const addCustomField = () => {
    const newField: DynamicField = {
      id: `cf_${Date.now().toString(36)}`,
      label: "",
      type: "text",
      required: false,
    };
    setTemplate((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const updateCustomField = (index: number, updates: Partial<DynamicField>) => {
    setTemplate((prev) => {
      const next = [...prev.customFields];
      next[index] = { ...next[index], ...updates };
      return { ...prev, customFields: next };
    });
  };

  const removeCustomField = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const addDocument = () => {
    const newDoc: DocumentRequirement = {
      id: `doc_${Date.now().toString(36)}`,
      name: "",
      categoryTrigger: availableCategories[0] || "IT",
      required: true,
      scope: "CATEGORY",
      validityType: "TIME_BOUND",
      isLifetime: false,
      maxSizeMb: 10,
      acceptedFileTypes: ["application/pdf", "image/png", "image/jpeg"],
    };
    setTemplate((prev) => ({
      ...prev,
      customCategoryDocuments: [...(prev.customCategoryDocuments || []), newDoc],
    }));
  };

  const updateDocument = (index: number, updates: Partial<DocumentRequirement>) => {
    setTemplate((prev) => {
      const next = [...(prev.customCategoryDocuments || [])];
      next[index] = { ...next[index], ...updates };
      return { ...prev, customCategoryDocuments: next };
    });
  };

  const removeDocument = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      customCategoryDocuments: (prev.customCategoryDocuments || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <button
            onClick={() => router.push("/registrations")}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to templates
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {templateId ? "Update Registration Form" : "Create Registration Template"}
          </h1>
          <p className="text-sm text-slate-500">
            Design registration rules, dynamic visibility criteria, and document requirements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-md bg-gray-950 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{templateId ? "Update Form" : "Create Form"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="p-3 bg-red-50 text-red-900 text-xs rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div role="status" className="p-3 bg-emerald-50 text-emerald-900 text-xs rounded-md border border-emerald-200 flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          <span>Form saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 pt-2 rounded-t-lg">
        {[
          { id: "basics", label: "Basic Details & Mode", icon: SlidersHorizontal },
          { id: "custom_fields", label: `Custom Fields (${template.customFields.length})`, icon: Layers },
          { id: "documents", label: `Documents (${COMMON_DOCUMENTS.length + CATEGORY_DOCUMENTS.length + (template.customCategoryDocuments?.length || 0)})`, icon: FileCheck },
          { id: "preview", label: "Live Form Preview", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 py-2.5 px-3.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-gray-950 text-gray-950 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-b-xl border border-t-0 border-slate-200">
        {/* TAB 1: BASICS */}
        {activeTab === "basics" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Template Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                placeholder="e.g. IT Equipment Suppliers Qualification 2026"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Registration Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={template.type}
                  onChange={(e) => setTemplate({ ...template, type: e.target.value as RegistrationType })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="OPEN">OPEN (Anyone can register directly)</option>
                  <option value="CLOSED">CLOSED (Whitelisted invited emails only)</option>
                  <option value="HYBRID">HYBRID (Requires Pre-Screening Review before full access)</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  {template.type === "OPEN" && "Allows open public access and instantaneous submission."}
                  {template.type === "CLOSED" && "Enforces invitation checking before the supplier can fill the form."}
                  {template.type === "HYBRID" && "Suppliers fill a mini interest pitch; admin approval is required to unlock full form."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Validity Window <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500">Start Date</span>
                    <input
                      type="date"
                      value={template.validity.startDate}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          validity: { ...template.validity, startDate: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">End Date</span>
                    <input
                      type="date"
                      value={template.validity.endDate}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          validity: { ...template.validity, endDate: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {template.type === "CLOSED" && (
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                  <Mail className="h-4 w-4 text-blue-600" /> Whitelisted Invitee Emails
                </div>
                <p className="text-xs text-blue-700">
                  Enter comma-separated or newline-separated email addresses authorized for this registration.
                </p>
                <textarea
                  value={invitedEmailInput}
                  onChange={(e) => setInvitedEmailInput(e.target.value)}
                  placeholder="vendor1@example.com, vendor2@example.com"
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Default Standard Fields Included
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Toggle standard supplier profile attributes to include in this registration program.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { key: "companyName", label: "Company Name" },
                  { key: "contactPerson", label: "Contact Person" },
                  { key: "email", label: "Business Email" },
                  { key: "phone", label: "Contact Phone" },
                  { key: "address", label: "Business Address" },
                  { key: "country", label: "Country" },
                  { key: "category", label: "Primary Category" },
                  { key: "annualTurnover", label: "Annual Turnover" },
                  { key: "expectedPurchaseValue", label: "Expected Purchase Value" },
                  { key: "productsServices", label: "Products / Services overview" },
                  { key: "companySize", label: "Company Size" },
                  { key: "bankDetails", label: "Bank Account & Routing" },
                  { key: "taxDetails", label: "Tax Details (GSTIN / PAN)" },
                  { key: "supplyingItem", label: "Supplying Item & Pricing (Item, Description, UOM, Price)" },
                ].map(({ key, label }) => {
                  const isChecked = template.basicFields[key as keyof typeof template.basicFields] ?? false;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? "border-blue-200 bg-blue-50/40 text-blue-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setTemplate({
                            ...template,
                            basicFields: {
                              ...template.basicFields,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM FIELDS */}
        {activeTab === "custom_fields" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Custom Dynamic Fields</h3>
                <p className="text-xs text-slate-500">
                  Add custom metadata fields for supplier registration.
                </p>
              </div>
              <button
                onClick={addCustomField}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" /> Add Field
              </button>
            </div>

            {template.customFields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No custom fields added yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add dynamic fields like ISO Certifications, Specific Risk Questions, or License Numbers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {template.customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Field #{idx + 1} ({field.id})
                      </span>
                      <button
                        onClick={() => removeCustomField(idx)}
                        className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Field Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateCustomField(idx, { label: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Field Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newType = e.target.value as FieldType;
                            const currentOpts =
                              field.options && field.options.length > 0
                                ? field.options
                                : ["select", "radio", "checkbox"].includes(newType)
                                ? ["Option 1", "Option 2"]
                                : undefined;
                            updateCustomField(idx, { type: newType, options: currentOpts });
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean (Toggle)</option>
                          <option value="date">Date</option>
                          <option value="select">Select Dropdown</option>
                          <option value="radio">Radio Buttons (Single Choice)</option>
                          <option value="checkbox">Checkboxes (Multiple Choice)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Placeholder (Optional)
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ""}
                          onChange={(e) => updateCustomField(idx, { placeholder: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateCustomField(idx, { required: e.target.checked })}
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          Is this field required?
                        </label>
                      </div>
                    </div>

                    {["select", "radio", "checkbox"].includes(field.type) && (
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-800">
                            Choice Options ({(field.options || []).length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentOptions = field.options || [];
                              updateCustomField(idx, {
                                options: [...currentOptions, `Option ${currentOptions.length + 1}`],
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded bg-gray-950 px-2.5 py-1 text-xs font-semibold text-white hover:bg-gray-800 transition"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add option</span>
                          </button>
                        </div>

                        {(!field.options || field.options.length === 0) ? (
                          <div className="text-xs text-slate-500 py-2.5 text-center bg-slate-50 rounded border border-dashed border-slate-200">
                            No options added yet. Click &quot;Add option&quot; to define choices.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {field.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-400 w-5 text-right shrink-0">
                                  {optIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const nextOptions = [...(field.options || [])];
                                    nextOptions[optIdx] = e.target.value;
                                    updateCustomField(idx, { options: nextOptions });
                                  }}
                                  placeholder={`Enter choice ${optIdx + 1}`}
                                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextOptions = (field.options || []).filter((_, i) => i !== optIdx);
                                    updateCustomField(idx, { options: nextOptions });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition shrink-0"
                                  title="Delete option"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Registry</h3>
                <p className="text-xs text-slate-500">
                  Common requirements are locked. Configure category-specific overrides and custom requirements.
                </p>
              </div>
              {/* <button
                onClick={addDocument}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" /> Add Custom Category Document
              </button> */}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Common requirements</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {COMMON_DOCUMENTS.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-semibold text-slate-900">{doc.name}</p><p className="mt-1 text-xs text-slate-500">{doc.required ? "Required" : "Optional"} · Lifetime</p></div>
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">Locked</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {DOCUMENT_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{category.label}</h4>
                  <div className="space-y-3">
                    {CATEGORY_DOCUMENTS.filter((doc) => doc.categoryTrigger === category.id).map((doc) => {
                      const override = template.documentOverrides?.[doc.id];
                      const enabled = override?.enabled !== false;
                      return (
                        <div
                          key={doc.id}
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div><p className="text-sm font-semibold text-slate-900">{doc.name}</p><p className="mt-1 text-xs text-slate-500">{enabled && (override?.required ?? doc.required) ? "Required" : "Optional"} · Time-bound · {doc.validityPeriod}</p></div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" checked={enabled} onChange={(e) => setTemplate((prev) => ({ ...prev, documentOverrides: { ...(prev.documentOverrides || {}), [doc.id]: { ...(prev.documentOverrides?.[doc.id] || {}), enabled: e.target.checked } } }))} /> Enabled</label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" disabled={!enabled} checked={override?.required ?? doc.required} onChange={(e) => setTemplate((prev) => ({ ...prev, documentOverrides: { ...(prev.documentOverrides || {}), [doc.id]: { enabled, required: e.target.checked } } }))} /> Required</label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {(template.customCategoryDocuments || []).map((doc, dIdx) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => updateDocument(dIdx, { name: e.target.value })}
                          placeholder="Document name (e.g. GST Registration)"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                            Category Trigger:
                          </span>
                          <select
                            value={doc.categoryTrigger}
                            onChange={(e) => updateDocument(dIdx, { categoryTrigger: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                          >
                            <option value="ALL">ALL (Applies to all categories)</option>
                            {availableCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat} Only
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={doc.description || ""}
                          onChange={(e) => updateDocument(dIdx, { description: e.target.value })}
                          placeholder="Description"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        />
                        <select
                          value={doc.validityType || "TIME_BOUND"}
                          onChange={(e) => updateDocument(dIdx, {
                            validityType: e.target.value as DocumentRequirement["validityType"],
                            isLifetime: e.target.value === "LIFETIME",
                          })}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                        >
                          <option value="TIME_BOUND">Time-bound</option>
                          <option value="LIFETIME">Lifetime</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.required}
                          onChange={(e) => updateDocument(dIdx, { required: e.target.checked })}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        Required
                      </label>
                      <button
                        onClick={() => removeDocument(dIdx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PREVIEW */}
        {activeTab === "preview" && (
          <div className="max-w-2xl mx-auto space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600">
                {template.type} Registration Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{template.title || "Untitled Template"}</h2>
              <p className="text-xs text-slate-500">
                Validity: {template.validity.startDate} to {template.validity.endDate}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Basic Attributes
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(template.basicFields).map(([k, enabled]) => (
                  <div
                    key={k}
                    className={`p-2.5 rounded-lg border ${
                      enabled ? "bg-white border-slate-200 text-slate-800" : "bg-slate-100 border-dashed border-slate-200 text-slate-400 line-through"
                    }`}
                  >
                    {k}
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Custom Fields ({template.customFields.length})
              </h4>
              {template.customFields.map((f) => (
                <div key={f.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-medium text-slate-900">
                    <span>{f.label}</span>
                    <span className="text-slate-400 text-[11px]">{f.type}</span>
                  </div>
                </div>
              ))}

              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Required Documents ({COMMON_DOCUMENTS.length + CATEGORY_DOCUMENTS.length + (template.customCategoryDocuments?.length || 0)})
              </h4>
              {[...COMMON_DOCUMENTS, ...CATEGORY_DOCUMENTS, ...(template.customCategoryDocuments || [])].map((d) => (
                <div key={d.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                  <span className="font-medium text-slate-900">{d.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                    Trigger: {d.categoryTrigger}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
