import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ROUTES, APP_CONFIG } from "@/lib/constants";
import { KeyboardShortcuts } from "@/components/accessibility/KeyboardShortcuts";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href={ROUTES.home} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="relative h-10 w-32">
                <Image
                  src="/logos/logo-white-bg.png"
                  alt="Pak-Exporters Logo"
                  fill
                  className="object-contain dark:hidden"
                  sizes="128px"
                />
                <Image
                  src="/logos/logo-black-bg.png"
                  alt="Pak-Exporters Logo"
                  fill
                  className="object-contain hidden dark:block"
                  sizes="128px"
                />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h2 className="font-semibold mb-4 text-base">{t("footer.quickLinks")}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.categories}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.browseCategories")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.companies}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.findSuppliers")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.rfq}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.submitRfq")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.blog}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.membership}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.membershipTiers")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h2 className="font-semibold mb-4 text-base">{t("footer.support")}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.about}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.contact}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.faq}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.terms}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.privacy}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h2 className="font-semibold mb-4 text-base">{t("footer.contactInfo")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t("footer.email")}: {APP_CONFIG.contact.email}</li>
              <li>{t("footer.phone")}: {APP_CONFIG.contact.phone}</li>
              <li>{t("footer.address")}: {APP_CONFIG.contact.address}</li>
              <li>{t("footer.hours")}: {APP_CONFIG.contact.workingHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t("footer.trademark", { year: currentYear })}
            </p>
            <div className="flex items-center gap-4">
              <KeyboardShortcuts />
              <div className="flex space-x-6">
                <Link
                  href="/linkedin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit our ${t("footer.linkedin")} page`}
                >
                  {t("footer.linkedin")}
                </Link>
                <Link
                  href="/twitter"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit our ${t("footer.twitter")} page`}
                >
                  {t("footer.twitter")}
                </Link>
                <Link
                  href="/facebook"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit our ${t("footer.facebook")} page`}
                >
                  {t("footer.facebook")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

