import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.about");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage() {
  return <AboutPageClient />;
}

