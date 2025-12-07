/**
 * i18n Configuration
 * Supports English, Urdu, and Chinese
 */

export const locales = ["en", "ur", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ur: "اردو", // Urdu
  zh: "中文", // Chinese
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  ur: "🇵🇰",
  zh: "🇨🇳",
};

// RTL languages
export const rtlLocales: Locale[] = ["ur"];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// Locale-specific formatting
export const localeConfig: Record<
  Locale,
  {
    dateFormat: Intl.DateTimeFormatOptions;
    numberFormat: Intl.NumberFormatOptions;
    currencyFormat: Intl.NumberFormatOptions;
  }
> = {
  en: {
    dateFormat: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  ur: {
    dateFormat: {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "islamic", // Islamic calendar for Urdu
    },
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  },
  zh: {
    dateFormat: {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "chinese", // Chinese calendar
    },
    numberFormat: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
};

