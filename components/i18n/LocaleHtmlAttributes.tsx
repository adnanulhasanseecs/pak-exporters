"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { isRTL } from "@/i18n/config";

interface LocaleHtmlAttributesProps {
  fontVariables: string;
}

/**
 * Client component that updates HTML attributes based on current locale
 * This must run on the client to avoid hydration mismatches
 * Must be used inside NextIntlClientProvider
 */
export function LocaleHtmlAttributes({ fontVariables }: LocaleHtmlAttributesProps) {
  const locale = useLocale();
  const rtl = isRTL(locale as any);

  useEffect(() => {
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      // Update HTML dir attribute for RTL support
      document.documentElement.dir = rtl ? "rtl" : "ltr";
      // Update body className with font variables and RTL class
      document.body.className = `${fontVariables} antialiased min-h-screen flex flex-col ${
        rtl ? "rtl" : ""
      }`;
    }
  }, [locale, rtl, fontVariables]);

  return null;
}

