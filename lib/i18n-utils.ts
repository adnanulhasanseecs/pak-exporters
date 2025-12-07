/**
 * i18n Utility Functions
 * Date, number, and currency formatting utilities
 */

import { Locale, localeConfig } from "@/i18n/config";

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  const formatOptions = options || localeConfig[locale].dateFormat;
  
  return new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : locale === "zh" ? "zh-CN" : "en-US", {
    ...formatOptions,
    timeZone: "Asia/Karachi", // Pakistan timezone
  }).format(dateObj);
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const formatOptions = options || localeConfig[locale].numberFormat;
  
  return new Intl.NumberFormat(locale === "ur" ? "ur-PK" : locale === "zh" ? "zh-CN" : "en-US", formatOptions).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string {
  const localeCode = locale === "ur" ? "ur-PK" : locale === "zh" ? "zh-CN" : "en-US";
  const currencyCode = currency || localeConfig[locale].currencyFormat.currency;
  const formatOptions = {
    ...localeConfig[locale].currencyFormat,
    currency: currencyCode,
    ...options,
  };
  
  return new Intl.NumberFormat(localeCode, formatOptions).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  locale: Locale,
  decimals: number = 0
): string {
  const localeCode = locale === "ur" ? "ur-PK" : locale === "zh" ? "zh-CN" : "en-US";
  
  return new Intl.NumberFormat(localeCode, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Get locale-specific date format string
 */
export function getDateFormat(locale: Locale): string {
  switch (locale) {
    case "ur":
      return "DD/MM/YYYY"; // Urdu date format
    case "zh":
      return "YYYY年MM月DD日"; // Chinese date format
    default:
      return "MM/DD/YYYY"; // English date format
  }
}

/**
 * Get currency symbol for locale
 */
export function getCurrencySymbol(locale: Locale): string {
  switch (locale) {
    case "ur":
      return "₨"; // Pakistani Rupee
    case "zh":
      return "¥"; // Chinese Yuan
    default:
      return "$"; // US Dollar
  }
}

