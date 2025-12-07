"use client";

import { motion } from "framer-motion";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import {
  Globe,
  Shield,
  Users,
  Award,
  TrendingUp,
  Zap,
  CheckCircle2,
  BarChart3,
  Building2,
  Target,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import Image from "next/image";

const categories = [
  "Agriculture",
  "Textiles & Garments",
  "Chemicals",
  "Surgical Instruments",
  "Leather & Sports Gears",
  "Apparel & Clothing",
  "Health & Hygiene Products",
  "Machinery & Equipment",
];

export function AboutPageClient() {
  const t = useTranslations("pages.about");
  const whyChooseFeatures = [
    {
      icon: Shield,
      title: "Super Fast Fulfillment",
      description: "Quick and efficient order processing and delivery",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "1st Fully Live Tracking",
      description: "Real-time tracking of your orders and shipments",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Sparkles,
      title: "45+ Unique Products",
      description: "Wide variety of export-quality products",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Award,
      title: "Export Quality Products",
      description: "Premium quality products meeting international standards",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: CheckCircle2,
      title: "Secure System",
      description: "Safe and secure transactions with verified suppliers",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Users,
      title: "Online Support 24/7",
      description: "Round-the-clock customer support for all your needs",
      gradient: "from-indigo-500 to-indigo-600",
    },
  ];

  const whatWeOffer = [
    {
      icon: Globe,
      title: "Global Connectivity",
      description: "Connect with B2B merchants worldwide and expand your business reach",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Advertising Platform",
      description: "Advertise with us to target the globe and reach international markets",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Online support 24/7 with caring professionalism for all your needs",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=1080&fit=crop&q=80"
            alt="Global business collaboration"
            fill
            className="object-cover"
            priority
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-primary/90" />
        </div>
        {/* Background gradient with glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/50 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeInOnScroll>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                {t("tagline")}
              </p>
              <Badge variant="outline" className="text-sm px-4 py-1">
                {t("since")}
              </Badge>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeInOnScroll>
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t("whoWeAre")}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                  {t("whoWeAreDescription")}
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeInOnScroll>
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t("ourMission")}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                  {t("ourMissionDescription")}
                </p>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("whyChooseUs")}
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyChooseFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeInOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("whatWeOffer")}
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {whatWeOffer.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${offer.gradient} rounded-xl shadow-lg`}>
                    <offer.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{offer.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {offer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeInOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {t("ourCategories")}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  {t("categoriesDescription")}
                </p>
              </div>
            </FadeInOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  <span className="text-sm font-medium text-foreground">{category}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

