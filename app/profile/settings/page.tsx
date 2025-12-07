import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware profile settings page
export default function ProfileSettingsPage() {
  redirect(`/${defaultLocale}/profile/settings`);
}
