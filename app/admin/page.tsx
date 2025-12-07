import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware admin page
export default function AdminPage() {
  redirect(`/${defaultLocale}/admin`);
}
