"use client";

import { useState } from "react";
import { useEffect } from "react";
import { SYSTEM_BUSINESS_RULES } from "@/src/data/mock";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import {
  Filter,
  Save,
} from "lucide-react";

export default function RulesPage() {
  const [rules, setRules] = useState(SYSTEM_BUSINESS_RULES);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setRules(storage.get(STORAGE_KEYS.businessRules, SYSTEM_BUSINESS_RULES));
  }, []);

  const filteredRules = rules.filter((r) => {
    if (selectedCategory === "ALL") return true;
    return r.category === selectedCategory;
  });

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const saveRules = () => {
    storage.set(STORAGE_KEYS.businessRules, rules);
    setSaveMessage("Rule activation settings saved.");
    window.setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
          Validation Rule Catalog (10 Example Rules)
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Configurable policies governing document validation, external registry checks, high-turnover thresholds, and cross-document data matching.
        </p>
      </header>

      {saveMessage && (
        <div role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          {saveMessage}
        </div>
      )}

      {/* Rules Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
          <Filter className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          <span>Category:</span>
          {["ALL", "COMPLIANCE", "FINANCIAL", "IDENTITY", "DOCUMENT"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-gray-950 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">
            {filteredRules.length} rules
          </span>
          <button
            type="button"
            onClick={saveRules}
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            Save Rules
          </button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-3">
        {filteredRules.map((rule, idx) => (
          <div
            key={rule.id}
            className={`p-4 rounded-lg border bg-white space-y-2.5 transition ${
              rule.enabled ? "border-gray-200 hover:border-gray-300" : "border-gray-200 opacity-60 bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-400 font-medium">
                    Rule #{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-medium ${
                      rule.severity === "CRITICAL"
                        ? "bg-red-50 text-red-900 border border-red-200"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">
                    {rule.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-950">{rule.name}</h3>
                <p className="text-xs text-gray-600">{rule.description}</p>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                  className="h-3.5 w-3.5 rounded text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <span>{rule.enabled ? "Active" : "Inactive"}</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                  Condition Trigger
                </span>
                <span className="font-mono text-gray-800 text-[11px] mt-0.5 block">
                  {rule.conditionSummary}
                </span>
              </div>

              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase">
                  Engine Enforcement
                </span>
                <span className="font-mono text-gray-800 text-[11px] mt-0.5 block">
                  {rule.actionSummary}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
