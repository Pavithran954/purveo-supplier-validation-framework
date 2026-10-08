import { SupplierRegistration } from "@/src/components/supplier/supplier-registration";

export default async function SupplierRegisterPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  return <SupplierRegistration registrationId={registrationId} />;
}
