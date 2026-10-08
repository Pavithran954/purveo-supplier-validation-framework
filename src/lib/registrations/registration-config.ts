import type { Registration, RegistrationType } from "@/src/types";

export function slugifyRegistrationName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getRegistrationUrl(registration: Pick<Registration, "id" | "link">): string {
  if (typeof window === "undefined") return registration.link;
  return `${window.location.origin}${registration.link || `/supplier/${registration.id}/register`}`;
}

export function createRegistrationId(name: string): string {
  const slug = slugifyRegistrationName(name) || "registration";
  return `${slug}-${Date.now().toString(36)}`;
}

export function getRegistrationPath(id: string, type: RegistrationType): string {
  return `/supplier/${id}/register?mode=${type}`;
}

export function validateRegistrationConfig(registration: Registration): string[] {
  const errors: string[] = [];
  if (!registration.name.trim()) errors.push("Registration name is required.");
  if (!registration.supplierCategory.trim()) errors.push("Supplier category is required.");
  if (!registration.startDate) errors.push("Start date is required.");
  if (!registration.endDate) errors.push("End date is required.");
  if (registration.startDate && registration.endDate && registration.endDate < registration.startDate) {
    errors.push("End date cannot be earlier than start date.");
  }
  if (!registration.type) errors.push("Registration mode is required.");
  if (!registration.standardFields?.some((field) => field.enabled && field.required)) {
    errors.push("Enable at least one required supplier field.");
  }
  return errors;
}
