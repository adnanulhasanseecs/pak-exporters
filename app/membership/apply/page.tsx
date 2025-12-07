import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware membership application page
export default function MembershipApplyPage() {
  redirect(`/${defaultLocale}/membership/apply`);
}
