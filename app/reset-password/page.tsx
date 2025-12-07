import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware reset password page
export default function ResetPasswordPage() {
  redirect(`/${defaultLocale}/reset-password`);
}
