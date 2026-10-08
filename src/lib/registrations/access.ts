import type { Registration, RegistrationAccessStatus } from "@/src/types";

export function getRegistrationAccessStatus(
  registration: Registration | undefined,
  currentDate = new Date(),
): RegistrationAccessStatus {
  if (!registration) return "not_found";
  if (registration.lifecycleStatus === "draft" || registration.status !== "active") return "inactive";
  const start = new Date(`${registration.startDate}T00:00:00`);
  const end = new Date(`${registration.endDate}T23:59:59.999`);
  if (currentDate < start) return "not_started";
  if (currentDate > end) return "expired";
  return "active";
}
