import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware search page
export default function SearchPage() {
  redirect(`/${defaultLocale}/search`);
}
