import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware FAQ page
export default function FAQPage() {
  redirect(`/${defaultLocale}/faq`);
}
