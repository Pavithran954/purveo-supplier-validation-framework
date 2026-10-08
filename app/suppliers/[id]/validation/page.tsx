import { redirect } from "next/navigation";

export default async function SupplierValidationRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/suppliers/${id}/result`);
}
