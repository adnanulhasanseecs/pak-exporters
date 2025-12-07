import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware privacy page
export default function PrivacyPage() {
  redirect(`/${defaultLocale}/privacy`);
}
