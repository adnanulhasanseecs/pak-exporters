import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware verify email page
export default function VerifyEmailPage() {
  redirect(`/${defaultLocale}/verify-email`);
}
