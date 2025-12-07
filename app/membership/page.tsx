import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware membership page
export default function MembershipPage() {
  redirect(`/${defaultLocale}/membership`);
}
