import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware terms page
export default function TermsPage() {
  redirect(`/${defaultLocale}/terms`);
}
