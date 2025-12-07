import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware forgot password page
export default function ForgotPasswordPage() {
  redirect(`/${defaultLocale}/forgot-password`);
}
