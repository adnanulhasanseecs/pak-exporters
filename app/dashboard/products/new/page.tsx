import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { ROUTES } from "@/lib/constants";

/**
 * Redirect non-locale dashboard products new page to locale-aware version
 */
export default function CreateProductPage() {
  redirect(`/${defaultLocale}${ROUTES.dashboardProductNew}`);
}
