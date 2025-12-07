import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware companies page
export default function CompaniesPage() {
  redirect(`/${defaultLocale}/companies`);
}
