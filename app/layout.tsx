import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/lib/constants";
import { getGeoMeta } from "@/lib/seo";

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

export const metadata: Metadata = {
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

/**
 * Root Layout - Contains HTML structure required by Next.js
 * Locale-specific attributes (lang, dir) are set by app/[locale]/layout.tsx via script
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: lang and dir attributes will be set dynamically by LocaleHtmlAttributes
  // in app/[locale]/layout.tsx based on the current locale
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
