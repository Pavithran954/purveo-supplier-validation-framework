import { RegistrationConfigurator } from "@/src/components/registration/registration-configurator";

export default async function RegistrationConfigurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RegistrationConfigurator templateId={id} />;
}
