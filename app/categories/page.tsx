import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware categories page
export default function CategoriesPage() {
  redirect(`/${defaultLocale}/categories`);
}

