import Link from "next/link";
import Image from "next/image";
import { ROUTES, APP_CONFIG } from "@/lib/constants";
import { KeyboardShortcuts } from "@/components/accessibility/KeyboardShortcuts";

export function Footer() {
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
              Pakistan&apos;s First Export Marketplace. Connecting exporters with global buyers since 2019.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h2 className="font-semibold mb-4 text-base">Quick Links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.categories}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.companies}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Find Suppliers
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.rfq}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Submit RFQ
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.membership}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Membership Tiers
                </Link>
              </li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h2 className="font-semibold mb-4 text-base">Resources</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={ROUTES.about}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.contact}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.faq}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.terms}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.privacy}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h2 className="font-semibold mb-4 text-base">Contact Info</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: {APP_CONFIG.contact.email}</li>
              <li>Phone: {APP_CONFIG.contact.phone}</li>
              <li>Address: {APP_CONFIG.contact.address}</li>
              <li>Hours: {APP_CONFIG.contact.workingHours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} PAK EXPORTERS REGISTERED TRADEMARK. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <KeyboardShortcuts />
              <div className="flex space-x-6">
                <Link
                  href="/linkedin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Visit our LinkedIn page"
                >
                  LinkedIn
                </Link>
                <Link
                  href="/twitter"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Visit our Twitter page"
                >
                  Twitter
                </Link>
                <Link
                  href="/facebook"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Visit our Facebook page"
                >
                  Facebook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

