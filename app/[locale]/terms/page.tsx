import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/constants";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { FileText } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Terms of Service - Pak-Exporters",
  description: "Terms of Service for Pak-Exporters B2B marketplace platform",
  path: ROUTES.terms || "/terms",
  keywords: ["terms of service", "terms", "legal", "pak-exporters"],
});

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing and using Pak-Exporters ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`,
  },
  {
    title: "2. Description of Service",
    content: `Pak-Exporters is a B2B marketplace platform that connects Pakistani exporters with global buyers. The Platform facilitates product listings, supplier discovery, RFQ (Request for Quotation) submissions, and business connections.`,
  },
  {
    title: "3. User Accounts",
    content: `Users must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.`,
  },
  {
    title: "4. Membership Tiers",
    content: `Pak-Exporters offers different membership tiers (Starter, Silver, Gold, Platinum) with varying features and benefits. Membership fees, if applicable, are charged according to the selected tier. You may upgrade or downgrade your membership at any time, subject to approval.`,
  },
  {
    title: "5. Supplier Responsibilities",
    content: `Suppliers are responsible for the accuracy of product listings, pricing, and business information. Suppliers must maintain active membership status to list products. All products are subject to review and approval before publication. Suppliers must comply with all applicable laws and regulations.`,
  },
  {
    title: "6. Buyer Responsibilities",
    content: `Buyers are responsible for verifying supplier credentials and product information before making purchasing decisions. RFQ submissions should be genuine and in good faith. Buyers must comply with all applicable laws and regulations.`,
  },
  {
    title: "7. Intellectual Property",
    content: `All content on the Platform, including but not limited to text, graphics, logos, images, and software, is the property of Pak-Exporters or its content suppliers and is protected by copyright and other intellectual property laws. Users retain ownership of content they submit but grant Pak-Exporters a license to use, display, and distribute such content on the Platform.`,
  },
  {
    title: "8. Prohibited Activities",
    content: `Users may not: (a) use the Platform for any illegal purpose; (b) post false, misleading, or fraudulent information; (c) infringe on intellectual property rights; (d) spam or harass other users; (e) attempt to gain unauthorized access to the Platform; (f) interfere with the Platform's operation.`,
  },
  {
    title: "9. Payment Terms",
    content: `Membership fees, if applicable, are charged in advance. All fees are non-refundable unless otherwise stated. Pak-Exporters reserves the right to change pricing with 30 days' notice to existing members.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `Pak-Exporters acts as a platform connecting buyers and suppliers. We do not guarantee the quality, safety, or legality of products listed. We are not responsible for transactions between users. Users transact at their own risk.`,
  },
  {
    title: "11. Termination",
    content: `Pak-Exporters reserves the right to terminate or suspend accounts that violate these Terms of Service. Users may terminate their accounts at any time. Upon termination, access to the Platform will be immediately revoked.`,
  },
  {
    title: "12. Changes to Terms",
    content: `Pak-Exporters reserves the right to modify these Terms of Service at any time. Users will be notified of significant changes. Continued use of the Platform after changes constitutes acceptance of the new terms.`,
  },
  {
    title: "13. Governing Law",
    content: `These Terms of Service are governed by the laws of Pakistan. Any disputes shall be resolved in the courts of Pakistan.`,
  },
  {
    title: "14. Contact Information",
    content: `For questions about these Terms of Service, please contact us at legal@pak-exporters.com or through our Contact page.`,
  },
];

export default function TermsPage() {
  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: "Terms of Service", path: ROUTES.terms || "/terms" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={createBreadcrumbStructuredData(breadcrumbs)} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              By using Pak-Exporters, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

