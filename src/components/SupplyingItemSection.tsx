"use client";

import { useEffect } from "react";
import {
  CATEGORY_ITEM_MAP,
  DEFAULT_ITEM_CONFIG,
} from "@/constants/itemCategories";
import { getCountryNorm } from "@/src/lib/country-norms";

export interface SupplyingItem {
  id: string;
  itemName: string;
  unitOfMeasurement: string;
  unitPrice: number | "";
}

interface Props {
  category?: string;
  country?: string;
  items: SupplyingItem[];
  onChange: (items: SupplyingItem[]) => void;
}

const createItemId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

const sanitizeNumber = (value: string): number | "" => {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [whole, ...decimals] = sanitized.split(".");
  const normalized = decimals.length
    ? `${whole}.${decimals.join("")}`
    : whole;

  return normalized === "" ? "" : Number(normalized);
};

export function createEmptySupplyingItem(
  defaultUnitOfMeasurement = DEFAULT_ITEM_CONFIG.uomOptions[0],
): SupplyingItem {
  return {
    id: createItemId(),
    itemName: "",
    unitOfMeasurement: defaultUnitOfMeasurement,
    unitPrice: "",
  };
}

export function SupplyingItemSection({
  category,
  country,
  items,
  onChange,
}: Props) {
  const config = CATEGORY_ITEM_MAP[category || ""] || DEFAULT_ITEM_CONFIG;
  const currency = getCountryNorm(country).currencySymbol;

  useEffect(() => {
    const normalizedItems = items.map((item) =>
      config.uomOptions.includes(item.unitOfMeasurement)
        ? item
        : { ...item, unitOfMeasurement: config.uomOptions[0] },
    );

    if (
      normalizedItems.some(
        (item, index) =>
          item.unitOfMeasurement !== items[index]?.unitOfMeasurement,
      )
    ) {
      onChange(normalizedItems);
    }
  }, [config.uomOptions, items, onChange]);

  const updateItem = (id: string, changes: Partial<SupplyingItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  };

  const addItem = () => {
    onChange([...items, createEmptySupplyingItem(config.uomOptions[0])]);
  };

  return (
    <section
      className="space-y-4 border-t border-gray-200 pt-4"
      aria-labelledby="supplying-item-heading"
    >
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <h2
          id="supplying-item-heading"
          className="text-sm font-bold text-gray-950"
        >
          Supplying Item &amp; Pricing Details
        </h2>
        <span className="text-[11px] font-medium text-gray-500">
          Item baseline for purchase requisition &amp; quote evaluation
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const selectedUom = config.uomOptions.includes(item.unitOfMeasurement)
            ? item.unitOfMeasurement
            : config.uomOptions[0];

          return (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <h3 className="text-xs font-bold text-gray-500">
                  Item {index + 1}
                </h3>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  {config.itemNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={item.itemName}
                  onChange={(event) =>
                    updateItem(item.id, { itemName: event.target.value })
                  }
                  placeholder={config.itemNamePlaceholder}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Unit of Measurement *
                </label>
                <select
                  required
                  value={selectedUom}
                  onChange={(event) =>
                    updateItem(item.id, {
                      unitOfMeasurement: event.target.value,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                >
                  {config.uomOptions.map((uom) => (
                    <option key={uom} value={uom}>
                      {uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Unit Price ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                    {currency}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, {
                        unitPrice: sanitizeNumber(event.target.value),
                      })
                    }
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 py-2.5 pl-8 pr-3 font-mono text-xs text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-950"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-950"
      >
        + Add Item
      </button>
    </section>
  );
}
