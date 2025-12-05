import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/constants";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { Shield } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Privacy Policy - Pak-Exporters",
  description: "Privacy Policy for Pak-Exporters B2B marketplace platform",
  path: ROUTES.privacy || "/privacy",
  keywords: ["privacy policy", "privacy", "data protection", "pak-exporters"],
});

const sections = [
  {
    title: "1. Introduction",
    content: `Pak-Exporters ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our B2B marketplace platform.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect information that you provide directly to us, including: (a) Account information (name, email, phone, business details); (b) Company information (company name, address, registration details); (c) Product information (listings, descriptions, images); (d) Transaction information (RFQs, inquiries, communications); (e) Payment information (processed securely through third-party providers). We also automatically collect certain information about your device and usage patterns.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use the information we collect to: (a) Provide and improve our services; (b) Process transactions and manage accounts; (c) Communicate with you about your account and our services; (d) Send marketing communications (with your consent); (e) Detect and prevent fraud; (f) Comply with legal obligations; (g) Analyze usage patterns to improve user experience.`,
  },
  {
    title: "4. Information Sharing",
    content: `We do not sell your personal information. We may share your information: (a) With other users as necessary for the Platform's functionality (e.g., displaying company profiles, product listings); (b) With service providers who assist in operating the Platform; (c) When required by law or to protect our rights; (d) In connection with a business transfer or merger.`,
  },
  {
    title: "5. Data Security",
    content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "6. Your Rights",
    content: `You have the right to: (a) Access your personal information; (b) Correct inaccurate information; (c) Request deletion of your information; (d) Object to processing of your information; (e) Request data portability; (f) Withdraw consent where processing is based on consent. To exercise these rights, contact us at privacy@pak-exporters.com.`,
  },
  {
    title: "7. Cookies and Tracking",
    content: `We use cookies and similar tracking technologies to track activity on our Platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.`,
  },
  {
    title: "8. Third-Party Services",
    content: `Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.`,
  },
  {
    title: "9. Data Retention",
    content: `We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, subject to legal retention requirements.`,
  },
  {
    title: "10. Children's Privacy",
    content: `Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.`,
  },
  {
    title: "11. International Data Transfers",
    content: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your information is protected.`,
  },
  {
    title: "12. Changes to This Privacy Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.`,
  },
  {
    title: "13. Contact Us",
    content: `If you have questions about this Privacy Policy, please contact us at privacy@pak-exporters.com or through our Contact page.`,
  },
];

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: "Privacy Policy", path: ROUTES.privacy || "/privacy" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={createBreadcrumbStructuredData(breadcrumbs)} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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
              Your privacy is important to us. If you have any concerns about how we handle your data, please contact us.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    );
}

