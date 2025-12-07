import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware company page
export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/${defaultLocale}/company/${id}`);
}
