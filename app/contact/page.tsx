import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware contact page
export default function ContactPage() {
  redirect(`/${defaultLocale}/contact`);
}
