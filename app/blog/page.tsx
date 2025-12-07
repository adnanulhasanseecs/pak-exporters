import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware blog page
export default function BlogPage() {
  redirect(`/${defaultLocale}/blog`);
}
