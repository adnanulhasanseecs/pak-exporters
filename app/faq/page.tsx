import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/constants";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { HelpCircle } from "lucide-react";

export const metadata = createPageMetadata({
  title: "Frequently Asked Questions - Pak-Exporters",
  description: "Find answers to common questions about Pak-Exporters B2B marketplace, membership tiers, product listings, and more.",
  path: ROUTES.faq || "/faq",
  keywords: ["FAQ", "help", "support", "questions", "pak-exporters"],
});

const faqCategories = [
  {
    title: "Getting Started",
    icon: "🚀",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Click on 'Join Free' in the top navigation bar, fill in your business details, and choose your membership tier. Buyers can start immediately, while suppliers need to complete membership approval.",
      },
      {
        question: "What are the different membership tiers?",
        answer:
          "We offer four membership tiers: Starter (for new businesses), Silver, Gold, and Platinum. Each tier offers different benefits including product listing limits, SEO optimization, verification badges, and priority support. Visit our Membership page to learn more.",
      },
      {
        question: "How long does membership approval take?",
        answer:
          "Our verification team typically reviews supplier membership applications within 2-3 business days. You'll receive an email notification once your application is approved or if additional information is needed.",
      },
    ],
  },
  {
    title: "For Suppliers",
    icon: "🏭",
    questions: [
      {
        question: "How do I list my products?",
        answer:
          "Once your supplier membership is approved, go to your Dashboard and click 'Upload New Product'. Fill in the product details, upload images, add specifications, and submit. Your product will be reviewed before going live.",
      },
      {
        question: "What SEO benefits do Platinum and Gold members get?",
        answer:
          "Platinum and Gold members receive automatic SEO optimization for all their products, including meta tags, JSON-LD structured data, geo-targeting, and keyword generation. This helps your products appear in search engines and AI-powered searches like ChatGPT.",
      },
      {
        question: "How many products can I list?",
        answer:
          "Product listing limits vary by membership tier. Starter members can list up to 10 products, Silver up to 50, Gold up to 200, and Platinum members have unlimited listings.",
      },
      {
        question: "Can I edit my product listings?",
        answer:
          "Yes! Go to your Dashboard > Manage Products, find the product you want to edit, and click the Edit button. You can update all product information including images, descriptions, pricing, and specifications.",
      },
    ],
  },
  {
    title: "For Buyers",
    icon: "🛒",
    questions: [
      {
        question: "How do I find suppliers?",
        answer:
          "Use our search bar to search by product name, category, or supplier name. You can also browse by category or use the 'Find Suppliers' page to filter by location, verification status, and membership tier.",
      },
      {
        question: "How do I submit an RFQ (Request for Quotation)?",
        answer:
          "Click on 'RFQ' in the navigation menu, fill in your product requirements, quantity, and specifications. Submit your RFQ and suppliers will respond with quotes. You can manage all your RFQs from your Dashboard.",
      },
      {
        question: "Are suppliers verified?",
        answer:
          "We verify all supplier companies through our verification process. Verified suppliers display a green 'Verified' badge. Gold and Platinum suppliers have additional verification and quality checks.",
      },
      {
        question: "How do I contact a supplier?",
        answer:
          "Visit the supplier's company page and use the contact form or send them an inquiry through the platform. You can also submit an RFQ to get quotes from multiple suppliers.",
      },
    ],
  },
  {
    title: "Membership & Pricing",
    icon: "💳",
    questions: [
      {
        question: "What's the difference between membership tiers?",
        answer:
          "Starter is free for new businesses. Silver offers basic features. Gold includes SEO optimization and priority support. Platinum provides unlimited listings, advanced SEO, featured placement, and dedicated account management.",
      },
      {
        question: "Can I upgrade my membership tier?",
        answer:
          "Yes! You can upgrade your membership tier at any time from your Dashboard. Your new tier benefits will be activated immediately after approval.",
      },
      {
        question: "Do I need to pay to use the platform as a buyer?",
        answer:
          "No, buyers can use the platform completely free. You can browse products, search suppliers, submit RFQs, and contact suppliers without any charges.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept major credit cards, bank transfers, and other payment methods. Payment processing is handled securely through our payment partners.",
      },
    ],
  },
  {
    title: "Technical Support",
    icon: "🔧",
    questions: [
      {
        question: "How do I reset my password?",
        answer:
          "Click on 'Sign In' and then 'Forgot Password'. Enter your email address and we'll send you a password reset link.",
      },
      {
        question: "Why can't I upload product images?",
        answer:
          "Make sure your images are in JPG, PNG, or WebP format and under 5MB each. You can upload up to 10 images per product. If you continue to have issues, contact our support team.",
      },
      {
        question: "How do I update my company profile?",
        answer:
          "Go to your Dashboard > Manage Companies, find your company, and click Edit. You can update your company information, logo, cover image, and business details.",
      },
      {
        question: "Where can I get help?",
        answer:
          "You can contact our support team through the Contact page, email us at support@pak-exporters.com, or use the live chat feature (available for Gold and Platinum members).",
      },
    ],
  },
];

export default function FAQPage() {
  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: "FAQ", path: ROUTES.faq || "/faq" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={createBreadcrumbStructuredData(breadcrumbs)} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about Pak-Exporters
          </p>
        </div>

        <div className="space-y-6">
          {faqCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${category.title}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href={ROUTES.contact}
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href="mailto:support@pak-exporters.com"
                className="text-primary hover:underline font-medium"
              >
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

