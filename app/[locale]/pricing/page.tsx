import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.pricing");
  return {
    title: `${t("title")} - Redirecting`,
    description: t("redirecting"),
  };
}

export default async function PricingPage() {
  redirect(ROUTES.membership);
}
