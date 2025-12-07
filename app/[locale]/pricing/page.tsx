import { redirect } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.pricing");
  return {
    title: `${t("title")} - Redirecting`,
    description: t("redirecting"),
  };
}

export default function PricingPage() {
  redirect(ROUTES.membership);
  // redirect() throws an exception in Next.js, so this return is unreachable
  // but included for type safety and clarity
  return null;
}
