"use client";

/**
 * Language Switcher Component
 * Allows users to switch between available languages with flag icons
 */

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Get current pathname without locale prefix
    const pathnameWithoutLocale = pathname
      .replace(`/${locale}`, "")
      .replace(/^\//, "") || "";
    
    // Construct new path with new locale
    let newPath: string;
    if (newLocale === routing.defaultLocale) {
      newPath = pathnameWithoutLocale ? `/${pathnameWithoutLocale}` : "/";
    } else {
      newPath = pathnameWithoutLocale ? `/${newLocale}/${pathnameWithoutLocale}` : `/${newLocale}`;
    }
    
    router.push(newPath);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 h-9 px-2 sm:px-2.5 border-2 hover:bg-accent hover:border-primary min-w-[2.75rem] sm:min-w-[5.5rem] flex items-center justify-center shadow-sm bg-background"
          aria-label={`Change language - Current: ${localeNames[locale]}`}
          title={`Current language: ${localeNames[locale]}`}
        >
          <span className="text-lg sm:text-xl leading-none flex-shrink-0">{localeFlags[locale]}</span>
          <span className="hidden sm:inline text-xs font-semibold">{localeNames[locale]}</span>
          <Globe className="h-4 w-4 opacity-80 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`cursor-pointer flex items-center gap-2 ${
              locale === loc ? "bg-accent font-medium" : ""
            }`}
          >
            <span className="text-lg">{localeFlags[loc]}</span>
            <span className="flex-1">{localeNames[loc]}</span>
            {locale === loc && (
              <span className="text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
