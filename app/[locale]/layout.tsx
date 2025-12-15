import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/lib/constants";
import { getGeoMeta, createWebsiteStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { PageTransition } from "@/components/layout/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipNavigation } from "@/components/accessibility/SkipNavigation";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { LocaleHtmlAttributes } from "@/components/i18n/LocaleHtmlAttributes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const fontVariables = `${geistSans.variable} ${geistMono.variable}`;

export function generateMetadata(): Metadata {
  return {
    title: {
      default: APP_CONFIG.name,
      template: `%s | ${APP_CONFIG.name}`,
    },
    description: APP_CONFIG.description,
    keywords: [
      "B2B marketplace",
      "Pakistani exporters",
      "global trade",
      "suppliers",
      "manufacturers",
      "export",
    ],
    authors: [{ name: APP_CONFIG.name }],
    creator: APP_CONFIG.name,
    metadataBase: new URL(APP_CONFIG.url),
    icons: {
      icon: [
        { url: "/favicon.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.png", sizes: "16x16", type: "image/png" },
      ],
      apple: [
        { url: "/favicon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: APP_CONFIG.url,
      siteName: APP_CONFIG.name,
      title: APP_CONFIG.name,
      description: APP_CONFIG.description,
      images: [
        {
          url: "/logos/logo-white-bg.png",
          width: 1200,
          height: 630,
          alt: APP_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: APP_CONFIG.name,
      description: APP_CONFIG.description,
      images: ["/logos/logo-white-bg.png"],
    },
    other: getGeoMeta(),
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlAttributes fontVariables={fontVariables} />
      <StructuredData data={createWebsiteStructuredData()} />
      <AnalyticsProvider>
        <ServiceWorkerRegistration />
        <GoogleAnalytics />
        <SkipNavigation />
        <ErrorBoundary>
          <Header />
          <main id="main-content" className="flex-1" role="main">
            <ErrorBoundary>
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </main>
          <Footer />
        </ErrorBoundary>
        <Toaster />
        <PWAInstallPrompt />
      </AnalyticsProvider>
    </NextIntlClientProvider>
  );
}

