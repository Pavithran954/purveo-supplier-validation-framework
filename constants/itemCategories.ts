export interface ItemCategoryConfig {
  itemNameLabel: string;
  itemNamePlaceholder: string;
  scopeDetailsLabel: string;
  scopeDetailsPlaceholder: string;
  uomOptions: string[];
}

export const DEFAULT_ITEM_CONFIG: ItemCategoryConfig = {
  itemNameLabel: "Item / Service Name",
  itemNamePlaceholder: "Enter the product or service you will supply",
  scopeDetailsLabel: "Scope / Technical Details",
  scopeDetailsPlaceholder:
    "Describe the scope, specifications, or delivery terms",
  uomOptions: ["Pieces (Pcs)", "Boxes", "Hours", "Months", "Kilograms (kg)"],
};

export const CATEGORY_ITEM_MAP: Record<string, ItemCategoryConfig> = {
  IT: {
    itemNameLabel: "Service / Software Deliverable Name",
    itemNamePlaceholder: "e.g. Managed Cloud Security Platform",
    scopeDetailsLabel: "SLA & Technical Architecture",
    scopeDetailsPlaceholder:
      "Describe service levels, architecture, integrations, and support terms",
    uomOptions: [
      "User Licenses (Seat)",
      "Months (Subscription)",
      "Hours (Consulting)",
      "Fixed Milestones",
      "Instances / APIs",
    ],
  },
  Logistics: {
    itemNameLabel: "Freight / Haulage Service Name",
    itemNamePlaceholder: "e.g. Temperature-Controlled Road Freight",
    scopeDetailsLabel: "Route Specs, Vehicle Class & Transit Terms",
    scopeDetailsPlaceholder:
      "Describe routes, vehicle class, transit windows, and handling terms",
    uomOptions: [
      "Kilometers (km)",
      "Metric Tonnes (MT)",
      "MT-KM",
      "Trips",
      "Containers (TEU)",
      "Pallets",
    ],
  },
  Civil: {
    itemNameLabel: "Civil Work / Material Item Name",
    itemNamePlaceholder: "e.g. Reinforced Concrete Supply and Pouring",
    scopeDetailsLabel: "Testing Standards (IS/ASTM) & Job Scope",
    scopeDetailsPlaceholder:
      "Describe job scope, applicable standards, testing, and site requirements",
    uomOptions: [
      "Cubic Meters (m³)",
      "Square Meters (m²)",
      "Running Meters (m)",
      "Metric Tonnes (MT)",
      "CFT",
      "Lump Sum",
    ],
  },
  Manufacturing: {
    itemNameLabel: "Supplying Component / Raw Material Name",
    itemNamePlaceholder: "e.g. Stainless Steel Precision Valve Assembly",
    scopeDetailsLabel: "Material Grade, Tolerances & Packaging",
    scopeDetailsPlaceholder:
      "Describe grade, tolerances, inspection, and packaging requirements",
    uomOptions: [
      "Pieces (Pcs)",
      "Kilograms (kg)",
      "Metric Tonnes (MT)",
      "Sets/Assemblies",
      "Cartons (Box)",
      "Meters (m)",
    ],
  },
  Healthcare: {
    itemNameLabel: "Formulation / Consumable Name",
    itemNamePlaceholder: "e.g. Sterile Injectable Consumable",
    scopeDetailsLabel: "Batch Specs, Shelf Life & Storage Conditions",
    scopeDetailsPlaceholder:
      "Describe batch specifications, shelf life, and storage requirements",
    uomOptions: [
      "Packs/Strips",
      "Bottles/Vials",
      "Boxes",
      "Kilograms (kg)",
      "Liters (L)",
      "Pieces (Pcs)",
    ],
  },
  "IT & Software Services": {
    ...DEFAULT_ITEM_CONFIG,
    ...{
      itemNameLabel: "Service / Software Deliverable Name",
      itemNamePlaceholder: "e.g. Managed Cloud Security Platform",
      scopeDetailsLabel: "SLA & Technical Architecture",
      scopeDetailsPlaceholder:
        "Describe service levels, architecture, integrations, and support terms",
      uomOptions: [
        "User Licenses (Seat)",
        "Months (Subscription)",
        "Hours (Consulting)",
        "Fixed Milestones",
        "Instances / APIs",
      ],
    },
  },
  "Logistics & Transport": { ...DEFAULT_ITEM_CONFIG },
  "Civil & Infrastructure": { ...DEFAULT_ITEM_CONFIG },
  "Manufacturing & Heavy Engineering": { ...DEFAULT_ITEM_CONFIG },
  "Healthcare, Pharma & Food": { ...DEFAULT_ITEM_CONFIG },
  "Healthcare, Pharma & Food Processing": { ...DEFAULT_ITEM_CONFIG },
};

CATEGORY_ITEM_MAP["Logistics & Transport"] = { ...CATEGORY_ITEM_MAP.Logistics };
CATEGORY_ITEM_MAP["Civil & Infrastructure"] = { ...CATEGORY_ITEM_MAP.Civil };
CATEGORY_ITEM_MAP["Manufacturing & Heavy Engineering"] = {
  ...CATEGORY_ITEM_MAP.Manufacturing,
};
CATEGORY_ITEM_MAP["Healthcare, Pharma & Food"] = {
  ...CATEGORY_ITEM_MAP.Healthcare,
};
CATEGORY_ITEM_MAP["Healthcare, Pharma & Food Processing"] = {
  ...CATEGORY_ITEM_MAP.Healthcare,
};
