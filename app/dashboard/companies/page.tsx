import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { ROUTES } from "@/lib/constants";

/**
 * Redirect non-locale dashboard companies page to locale-aware version
 */
export default function DashboardCompaniesPage() {
  redirect(`/${defaultLocale}${ROUTES.dashboardCompanies}`);
}
