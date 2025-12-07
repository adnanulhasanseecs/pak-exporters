import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware pricing/membership page
export default function PricingPage() {
  redirect(`/${defaultLocale}/pricing`);
}
