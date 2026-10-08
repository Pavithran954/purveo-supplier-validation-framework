import { redirect } from "next/navigation";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/suppliers/${id}/result`);
}
