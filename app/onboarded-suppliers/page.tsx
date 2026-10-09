"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  X,
  Users,
  ShieldAlert,
  Filter,
} from "lucide-react";
import { RegistrationTemplate, SupplierSubmission } from "@/types/builder";
import { storage } from "@/src/lib/storage";
import { STORAGE_KEYS } from "@/src/config/storage";
import { initialSubmissions, initialTemplates } from "@/src/data/mock";
import { getCountryNorm } from "@/src/lib/country-norms";

export default function OnboardedSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierSubmission[]>([]);
  const [templates, setTemplates] = useState<RegistrationTemplate[]>([]);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierSubmission | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<SupplierSubmission | null>(
    null,
  );
  const [productTypeFilter, setProductTypeFilter] = useState("ALL");

  const loadSuppliers = () => {
    setSuppliers(
      storage
        .get<SupplierSubmission[]>(STORAGE_KEYS.submissions, initialSubmissions)
        .filter((submission) => submission.validationStatus === "APPROVED"),
    );
  };

  useEffect(() => {
    loadSuppliers();
    setTemplates(
      storage.get<RegistrationTemplate[]>(
        STORAGE_KEYS.templates,
        initialTemplates,
      ),
    );
  }, []);

  const getTemplateTitle = (templateId: string) =>
    templates.find((template) => template.id === templateId)?.title ||
    templateId;

  const productTypes = Array.from(
    new Set(
      suppliers
        .map((supplier) => String(supplier.data?.productType || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const filteredSuppliers =
    productTypeFilter === "ALL"
      ? suppliers
      : suppliers.filter(
          (supplier) =>
            String(supplier.data?.productType || "").trim() ===
            productTypeFilter,
        );

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-950">
            Onboarded Suppliers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Suppliers approved by Admin and moved out of the submission queue.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Approved
          </span>
          <strong className="text-xl text-emerald-900">
            {suppliers.length}
          </strong>
        </div>
      </header>

      {suppliers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <Users
            className="mx-auto mb-3 h-8 w-8 text-gray-300"
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-gray-700">
            No onboarded suppliers yet
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Suppliers will appear here after Admin approves their submissions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-end gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Filter
              className="h-3.5 w-3.5 text-gray-400"
              aria-hidden="true"
            />
            <label
              htmlFor="product-type-filter"
              className="text-xs font-semibold text-gray-600"
            >
              Product Type
            </label>
            <select
              id="product-type-filter"
              value={productTypeFilter}
              onChange={(event) => setProductTypeFilter(event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus-visible:outline-2 focus-visible:outline-gray-900"
            >
              <option value="ALL">All Product Types</option>
              {productTypes.map((productType) => (
                <option key={productType} value={productType}>
                  {productType}
                </option>
              ))}
            </select>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <Users
                className="mx-auto mb-3 h-8 w-8 text-gray-300"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold text-gray-700">
                No suppliers match this product type
              </h2>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {[
                      "Supplier",
                      "Category",
                      "Product Type",
                      "Program",
                      "Approved",
                      "Details",
                    ].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <strong className="block text-sm text-gray-900">
                      {supplier.data?.companyName || "Unknown Entity"}
                    </strong>
                    <span className="text-[10px] font-mono text-gray-400">
                      {supplier.id}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    {supplier.data?.category || "Nil"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    {supplier.data?.productType || "Not provided"}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    {getTemplateTitle(supplier.templateId)}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(supplier.submittedAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2 px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSupplier(supplier)}
                        className="inline-flex text-nowrap items-center gap-1.5 rounded-md bg-gray-950 px-3 py-2 text-xs font-medium cursor-pointer text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-gray-900"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(supplier)}
                        className="ml-2 text-nowrap inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 py-2 text-xs font-medium cursor-pointer text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
                      >
                        <ShieldAlert
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Revoke Approval
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedSupplier && (
        <SupplierDetailsDialog
          supplier={selectedSupplier}
          templateTitle={getTemplateTitle(selectedSupplier.templateId)}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
      {revokeTarget && (
        <RevokeApprovalDialog
          supplier={revokeTarget}
          onClose={() => setRevokeTarget(null)}
          onRevokeOnly={() => {
            updateApproval(revokeTarget, "REVIEW_REQUIRED");
            setRevokeTarget(null);
            setSelectedSupplier(null);
          }}
          onRevokeAndDelete={() => {
            const submissions = storage.get<SupplierSubmission[]>(
              STORAGE_KEYS.submissions,
              initialSubmissions,
            );
            storage.set(
              STORAGE_KEYS.submissions,
              submissions.filter(
                (submission) => submission.id !== revokeTarget.id,
              ),
            );
            setRevokeTarget(null);
            setSelectedSupplier(null);
            loadSuppliers();
          }}
        />
      )}
    </div>
  );

  function updateApproval(
    supplier: SupplierSubmission,
    status: "REVIEW_REQUIRED",
  ) {
    const submissions = storage.get<SupplierSubmission[]>(
      STORAGE_KEYS.submissions,
      initialSubmissions,
    );
    storage.set(
      STORAGE_KEYS.submissions,
      submissions.map((submission) =>
        submission.id === supplier.id
          ? {
              ...submission,
              validationStatus: status,
              adminOverrideStatus: status,
            }
          : submission,
      ),
    );
    loadSuppliers();
  }
}

function SupplierDetailsDialog({
  supplier,
  templateTitle,
  onClose,
}: {
  supplier: SupplierSubmission;
  templateTitle: string;
  onClose: () => void;
}) {
  const data = supplier.data || {};
  const currency = getCountryNorm(data.country).currencySymbol;
  const items = Array.isArray(data.items) ? data.items : [];
  const itemPrices = items
    .map((item: { unitPrice?: number | string }) => item.unitPrice)
    .filter(
      (price: number | string | undefined): price is number | string =>
        price !== "" && price !== undefined && price !== null,
    )
    .map(Number)
    .filter((price) => Number.isFinite(price));
  const averageItemPrice = itemPrices.length
    ? itemPrices.reduce((total, price) => total + price, 0) /
      itemPrices.length
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-details-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-gray-200 bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="supplier-details-title"
                className="text-lg font-bold text-gray-950"
              >
                {data.companyName || "Supplier Details"}
              </h2>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                Approved
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{supplier.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close supplier details"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <DetailGroup
            title="Registration"
            values={[
              ["Program", templateTitle],
              ["Category", data.category || "Nil"],
              ["Product Type", data.productType || "Not provided"],
              ["Country", data.country || "Nil"],
              ["Email", data.email || "Nil"],
              ["Contact Person", data.contactPerson || "Nil"],
              ["Phone", data.phone || "Nil"],
              ["Address", data.address || "Nil"],
            ]}
          />
          <DetailGroup
            title="Supplying & Pricing"
            values={[
              [
                "Supplying Items",
                items.length
                  ? items
                      .filter((item: { itemName?: string }) => item.itemName)
                      .map(
                        (item: {
                          itemName: string;
                          unitOfMeasurement?: string;
                          unitPrice?: number | string;
                        }) =>
                          `${item.itemName} (${item.unitOfMeasurement || "Units"}) · ${currency}${Number(item.unitPrice || 0).toLocaleString()}`,
                      )
                      .join(" | ")
                  : data.supplyingItemName || "Nil",
              ],
              ["Technical Details", data.itemDescription || "Nil"],
              [
                "Average Unit Price",
                averageItemPrice === null
                  ? "Nil"
                  : `${currency}${averageItemPrice.toLocaleString()}`,
              ],
            ]}
          />
          <DetailGroup
            title="Financial & Tax"
            values={[
              ["Annual Turnover", data.annualTurnover || "Nil"],
              ["Expected Purchase Value", data.expectedPurchaseValue || "Nil"],
              ["GST / Tax Number", data.gstNumber || "Nil"],
              ["PAN / Tax Identity", data.panNumber || "Nil"],
              ["Bank Account", data.bankAccount || "Nil"],
              ["IFSC / Routing Code", data.ifscCode || "Nil"],
            ]}
          />
          <DetailGroup
            title="Submission"
            values={[
              ["Submission ID", supplier.id],
              [
                "Submitted",
                new Date(supplier.submittedAt).toLocaleString("en-GB"),
              ],
              ["Validation Score", supplier.validationScore ?? "Nil"],
              ["Documents Uploaded", supplier.documentsUploaded?.length ?? 0],
              ["Admin Review Notes", supplier.adminReviewNotes || "Nil"],
            ]}
          />
          <DetailGroup
            title="Additional Form Responses"
            values={Object.entries(data)
              .filter(
                ([key]) =>
                  ![
                    "companyName",
                    "category",
                    "productType",
                    "country",
                    "email",
                    "contactPerson",
                    "phone",
                    "address",
                    "supplyingItemName",
                    "itemDescription",
                    "unitOfMeasurement",
                    "unitPrice",
                    "unitPriceMin",
                    "unitPriceMax",
                    "annualTurnover",
                    "expectedPurchaseValue",
                    "gstNumber",
                    "panNumber",
                    "bankAccount",
                    "ifscCode",
                  ].includes(key),
              )
              .map(([key, value]) => [
                key,
                Array.isArray(value)
                  ? value.join(", ")
                  : String(value || "Nil"),
              ])}
          />
          <DetailGroup
            title="Uploaded Documents"
            values={
              supplier.documentsUploaded?.length
                ? supplier.documentsUploaded.map((document) => [
                    document.docId,
                    document.fileName,
                  ])
                : [["Documents", "Nil"]]
            }
          />
        </div>
      </section>
    </div>
  );
}

function RevokeApprovalDialog({
  supplier,
  onClose,
  onRevokeOnly,
  onRevokeAndDelete,
}: {
  supplier: SupplierSubmission;
  onClose: () => void;
  onRevokeOnly: () => void;
  onRevokeAndDelete: () => void;
}) {
  const companyName = supplier.data?.companyName || "this supplier";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-approval-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <h2
          id="revoke-approval-title"
          className="text-base font-bold text-gray-950"
        >
          Revoke supplier approval?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Choose what should happen to <strong>{companyName}</strong>.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRevokeAndDelete}
            className="rounded-md bg-rose-700 px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-rose-700"
          >
            Revoke approval and delete supplier
          </button>
          <button
            type="button"
            onClick={onRevokeOnly}
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-left text-sm font-semibold text-amber-800 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-amber-700"
          >
            Revoke approval only
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-900"
          >
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}

function DetailGroup({
  title,
  values,
}: {
  title: string;
  values: Array<[string, string | number]>;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      <dl className="space-y-2">
        {values.map(([label, value]) => (
          <div
            key={label}
            className="border-b border-gray-100 pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-[11px] text-gray-500">{label}</dt>
            <dd className="break-words text-xs font-medium text-gray-900">
              {String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
