import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware RFQ page
export default function RFQPage() {
  redirect(`/${defaultLocale}/rfq`);
}
