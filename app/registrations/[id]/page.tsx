import { redirect } from "next/navigation";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/registrations/${id}/configure`);
}
