import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware about page
export default function AboutPage() {
  redirect(`/${defaultLocale}/about`);
}
