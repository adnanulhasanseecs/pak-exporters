import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Root page redirects to default locale
// With localePrefix: "as-needed", this redirect ensures proper routing
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
