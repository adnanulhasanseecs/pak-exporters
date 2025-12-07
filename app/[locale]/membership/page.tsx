import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Shield, Star, CheckCircle2, CircleDot, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("pages.membership");
  return {
    title: t("title"),
    description: t("description") || "Learn about our supplier membership tiers: Platinum, Gold, and Silver. Understand the evaluation criteria and benefits of each tier.",
  };
}

const membershipTiers = [
  {
    tier: "starter",
    name: "Starter Supplier",
    color: "bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-900 dark:to-blue-700",
    badgeColor: "bg-blue-500",
    icon: CircleDot,
    description: "Perfect for new businesses starting their export journey",
    benefits: [
      "Basic product listings",
      "Company profile page",
      "Email support",
      "Buyer inquiry access",
      "Product promotion tools",
      "Monthly performance reports",
    ],
    criteria: {
      minimumYears: 0,
      minimumProducts: 5,
      minimumSales: 0,
      trustScore: 0,
      responseRate: 80,
      certifications: ["Business registration"],
      verification: "Basic business verification required",
      references: "Not required",
    },
    evaluation: "Entry-level tier for new businesses. No minimum requirements - perfect for startups and new exporters looking to establish their presence.",
  },
  {
    tier: "platinum",
    name: "Platinum Supplier",
    color: "bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-600",
    badgeColor: "bg-gray-500",
    icon: Star,
    description: "Our highest tier for the most trusted and established suppliers",
    benefits: [
      "Premium placement in search results",
      "Featured placement on homepage",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Custom branding options",
      "Dedicated account manager",
      "Exclusive trade show invitations",
    ],
    criteria: {
      minimumYears: 10,
      minimumProducts: 100,
      minimumSales: 1000000,
      trustScore: 95,
      responseRate: 98,
      certifications: ["ISO 9001", "ISO 14001", "Additional industry certifications"],
      verification: "On-site factory inspection required",
      references: "Minimum 50 verified buyer references",
    },
    evaluation: "Similar to Alibaba's Gold Supplier Plus or Pak-China's Premium Member tier. Requires comprehensive business verification, financial stability, and proven track record.",
  },
  {
    tier: "gold",
    name: "Gold Supplier",
    color: "bg-gradient-to-br from-yellow-50 to-yellow-200 dark:from-yellow-900 dark:to-yellow-700",
    badgeColor: "bg-yellow-500",
    icon: Award,
    description: "Verified suppliers with excellent track records and quality products",
    benefits: [
      "Enhanced visibility in search results",
      "Featured product placement",
      "Priority listing in category pages",
      "Advanced product analytics",
      "Email marketing support",
      "Trade show participation opportunities",
      "Buyer inquiry priority",
    ],
    criteria: {
      minimumYears: 5,
      minimumProducts: 50,
      minimumSales: 500000,
      trustScore: 85,
      responseRate: 95,
      certifications: ["ISO 9001 or equivalent"],
      verification: "Business license and company verification required",
      references: "Minimum 20 verified buyer references",
    },
    evaluation: "Similar to Alibaba's Gold Supplier or TradeKey's Gold Member. Requires business verification, quality certifications, and consistent performance metrics.",
  },
  {
    tier: "silver",
    name: "Silver Supplier",
    color: "bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-600",
    badgeColor: "bg-slate-400",
    icon: Shield,
    description: "Reliable suppliers building their reputation in the marketplace",
    benefits: [
      "Standard visibility in search results",
      "Product listing management",
      "Basic analytics dashboard",
      "Email support",
      "Buyer inquiry access",
      "Product promotion tools",
      "Monthly performance reports",
    ],
    criteria: {
      minimumYears: 2,
      minimumProducts: 20,
      minimumSales: 100000,
      trustScore: 75,
      responseRate: 90,
      certifications: ["Business registration"],
      verification: "Basic business verification required",
      references: "Minimum 5 verified buyer references",
    },
    evaluation: "Entry-level verified tier for suppliers establishing their presence. Similar to Alibaba's Verified Supplier or standard membership on other platforms.",
  },
];

export default async function MembershipPage() {
  const t = await getTranslations("pages.membership");
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t("subtitle") || "Our membership tiers are designed to help buyers identify trusted suppliers while providing suppliers with tools to grow their business. Each tier represents a different level of verification, experience, and commitment to quality."}
        </p>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {t("evaluationCriteria") || "Evaluation Criteria"}
          </h2>
          <p className="text-muted-foreground">
            {t("evaluationDescription") || "Our evaluation criteria are inspired by industry leaders like Alibaba, TradeKey, and Pak-China. We assess suppliers based on business history, product quality, sales performance, customer satisfaction, and verification status. This multi-faceted approach ensures buyers can trust the suppliers they work with."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {membershipTiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card key={tier.tier} className="flex flex-col">
              <CardHeader className={`${tier.color} rounded-t-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 text-foreground" />
                  <Badge className={tier.badgeColor} variant="default">
                    {tier.name}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-foreground/80">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t("benefits") || "Benefits"}
                    </h3>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t("criteria") || "Criteria"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Years in Business:</span>
                        <span className="font-medium">{tier.criteria.minimumYears}+ years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Products:</span>
                        <span className="font-medium">{tier.criteria.minimumProducts}+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Sales:</span>
                        <span className="font-medium">
                          ${tier.criteria.minimumSales.toLocaleString()}+
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trust Score:</span>
                        <span className="font-medium">{tier.criteria.trustScore}+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Rate:</span>
                        <span className="font-medium">{tier.criteria.responseRate}%+</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          <strong>Certifications:</strong> {tier.criteria.certifications.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          <strong>Verification:</strong> {tier.criteria.verification}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>References:</strong> {tier.criteria.references}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground italic mb-4">{tier.evaluation}</p>
                    <Button asChild className="w-full">
                      <Link href={ROUTES.membershipApply}>
                        {t("applyFor", { tier: tier.name }) || `Apply for ${tier.name}`}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("howItWorks") || "How Membership Tiers Work"}</CardTitle>
            <CardDescription>
              {t("howItWorksDescription") || "Understanding our tiered system and how suppliers can upgrade"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t("initialAssessment") || "Initial Assessment"}</h3>
              <p className="text-sm text-muted-foreground">
                {t("initialAssessmentDescription") || "All suppliers start with basic verification. Our team reviews business licenses, company information, and initial product listings to assign an appropriate tier."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("performanceMonitoring") || "Performance Monitoring"}</h3>
              <p className="text-sm text-muted-foreground">
                {t("performanceMonitoringDescription") || "We continuously monitor supplier performance including response rates, order fulfillment, buyer feedback, and sales volume. Suppliers can upgrade to higher tiers by meeting the criteria."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("tierUpgrades") || "Tier Upgrades"}</h3>
              <p className="text-sm text-muted-foreground">
                {t("tierUpgradesDescription") || "Suppliers can apply for tier upgrades when they meet the minimum requirements. Our verification team conducts a comprehensive review including on-site inspections for Platinum tier applicants."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("benefitsForBuyers") || "Benefits for Buyers"}</h3>
              <p className="text-sm text-muted-foreground">
                {t("benefitsForBuyersDescription") || "Higher-tier suppliers are more visible in search results and have proven track records. Buyers can filter products by supplier tier to find the most trusted suppliers for their needs."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

