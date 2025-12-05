"use client";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { MembershipCTASection } from "@/components/home/MembershipCTASection";
import { MembershipButton } from "@/components/home/MembershipButton";
import {
  ArrowRight,
  Users,
  Globe,
  Award,
  Sparkles,
  Search,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import type { Category } from "@/types/category";
import type { ProductListItem } from "@/types/product";

export const dynamic = "force-dynamic";

// Mock data - will be replaced with API calls
// Categories based on pak-exporters.com - Main Product Categories
const featuredCategories: Category[] = [
  {
    id: "1",
    name: "Agriculture",
    slug: "agriculture",
    description: "Farm exports including Rice (Basmati, Long Grain, Parboiled), Fruits (Mangoes, Oranges), Vegetables (Potatoes, Tomatoes, Onions)",
    productCount: 1250,
    level: 1,
    order: 1,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    name: "Textiles & Garments",
    slug: "textiles-garments",
    description: "Fashion, Shoes, T-Shirts, Designer Suits, Woven Fabrics, Cotton, Polyester, Silk Fabrics, Men's & Women's Apparel",
    productCount: 1850,
    level: 1,
    order: 2,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Leather & Sports Gears",
    slug: "leather-sports-gears",
    description: "Bags, Leather Goods, Leather Apparel, Jackets, Belts, Leather Footwear, Sports Goods, Sports Gloves, Cricket Bats, Footballs",
    productCount: 950,
    level: 1,
    order: 3,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Surgical Instruments",
    slug: "surgical-instruments",
    description: "Scalpels, Forceps, Surgical Scissors, Surgical Needles, Retractors and medical equipment",
    productCount: 680,
    level: 1,
    order: 4,
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Chemicals",
    slug: "chemicals",
    description: "Industrial chemicals, detergents, pharmaceuticals, and chemical products",
    productCount: 420,
    level: 1,
    order: 5,
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Apparel & Clothing",
    slug: "apparel-clothing",
    description: "Men's and Women's clothing, fashion apparel, ready-to-wear garments",
    productCount: 1200,
    level: 1,
    order: 6,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
  },
  {
    id: "7",
    name: "Health & Hygiene Products",
    slug: "health-hygiene",
    description: "Health and hygiene products, medical supplies, and wellness items",
    productCount: 350,
    level: 1,
    order: 7,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
  },
  {
    id: "8",
    name: "Machinery & Equipment",
    slug: "machinery-equipment",
    description: "Industrial machinery, tools, equipment, and manufacturing supplies",
    productCount: 280,
    level: 1,
    order: 8,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop",
  },
  {
    id: "9",
    name: "Food & Hygiene",
    slug: "food-hygiene",
    description: "Food products, beverages, herbs, and hygiene items",
    productCount: 520,
    level: 1,
    order: 9,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop",
  },
  {
    id: "10",
    name: "Office & School Supplies",
    slug: "office-school-supplies",
    description: "Office stationery, school accessories, educational supplies",
    productCount: 380,
    level: 1,
    order: 10,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
  },
  {
    id: "11",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic components, hardware, computers, and electronic devices",
    productCount: 450,
    level: 1,
    order: 11,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
  },
  {
    id: "12",
    name: "Furniture",
    slug: "furniture",
    description: "Wood furniture, cane furniture, executive furniture, and home furnishings",
    productCount: 320,
    level: 1,
    order: 12,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  },
  {
    id: "13",
    name: "Accessories",
    slug: "accessories",
    description: "Caps, Hats, and fashion accessories",
    productCount: 280,
    level: 1,
    order: 13,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop",
  },
  {
    id: "14",
    name: "Others",
    slug: "others",
    description: "Miscellaneous products and other export items",
    productCount: 150,
    level: 1,
    order: 14,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  },
];

// Trending products with sales data
const trendingProducts: ProductListItem[] = [
  {
    id: "1",
    name: "Fashionable Leather Handbags",
    shortDescription: "Premium quality leather handbags in various designs",
    price: { amount: 25.0, currency: "USD", minOrderQuantity: 50 },
    images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop"],
    category: { id: "3", name: "Leather & Sports Gears", slug: "leather-sports-gears" },
    company: { id: "1", name: "Anchor Group", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 1250, totalSold: 8500, viewsLast7Days: 3200 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Organic Brown Rice",
    shortDescription: "Premium quality organic brown rice, export grade",
    price: { amount: 850.0, currency: "USD", minOrderQuantity: 1 },
    images: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop"],
    category: { id: "1", name: "Agriculture", slug: "agriculture" },
    company: { id: "2", name: "Paktherm", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 890, totalSold: 5200, viewsLast7Days: 2100 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Surgical Needles",
    shortDescription: "High-quality surgical needles, sterilizable",
    price: { amount: 12.0, currency: "USD", minOrderQuantity: 10 },
    images: ["https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop"],
    category: { id: "4", name: "Surgical Instruments", slug: "surgical-instruments" },
    company: { id: "3", name: "Unicol", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 650, totalSold: 3800, viewsLast7Days: 1800 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Cotton T-Shirts",
    shortDescription: "100% cotton t-shirts, various sizes and colors",
    price: { amount: 8.5, currency: "USD", minOrderQuantity: 100 },
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"],
    category: { id: "2", name: "Textiles & Garments", slug: "textiles-garments" },
    company: { id: "4", name: "Himalayan Salt", verified: true, goldSupplier: false },
    status: "active",
    salesData: { soldLast7Days: 2100, totalSold: 12500, viewsLast7Days: 4500 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Elegant Leather Gloves",
    shortDescription: "Premium leather gloves for sports and fashion",
    price: { amount: 18.0, currency: "USD", minOrderQuantity: 50 },
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"],
    category: { id: "3", name: "Leather & Sports Gears", slug: "leather-sports-gears" },
    company: { id: "5", name: "MR. CRAFTS TREASURES", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 780, totalSold: 4200, viewsLast7Days: 1900 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Sharp Surgical Scissors",
    shortDescription: "Precision surgical scissors, high-grade stainless steel",
    price: { amount: 15.0, currency: "USD", minOrderQuantity: 20 },
    images: ["https://pak-exporters.com/wp-content/uploads/rem-41.webp"],
    category: { id: "4", name: "Surgical Instruments", slug: "surgical-instruments" },
    company: { id: "6", name: "ELA", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 520, totalSold: 2900, viewsLast7Days: 1400 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "7",
    name: "Sweet Pakistani Mangoes",
    shortDescription: "Fresh, export-quality Pakistani mangoes",
    price: { amount: 45.0, currency: "USD", minOrderQuantity: 1 },
    images: ["https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop"],
    category: { id: "1", name: "Agriculture", slug: "agriculture" },
    company: { id: "1", name: "Anchor Group", verified: true, goldSupplier: true },
    status: "active",
    salesData: { soldLast7Days: 1850, totalSold: 9800, viewsLast7Days: 5200 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "8",
    name: "Cricket Bats",
    shortDescription: "Professional grade cricket bats, various sizes",
    price: { amount: 35.0, currency: "USD", minOrderQuantity: 10 },
    images: ["https://pak-exporters.com/wp-content/uploads/rem-23.webp"],
    category: { id: "3", name: "Leather & Sports Gears", slug: "leather-sports-gears" },
    company: { id: "2", name: "Paktherm", verified: true, goldSupplier: false },
    status: "active",
    salesData: { soldLast7Days: 420, totalSold: 2100, viewsLast7Days: 1100 },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

// Featured products from Gold Suppliers
const featuredGoldProducts: ProductListItem[] = [
  {
    id: "1",
    name: "Fashionable Leather Handbags",
    shortDescription: "Premium quality leather handbags in various designs",
    price: { amount: 25.0, currency: "USD", minOrderQuantity: 50 },
    images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop"],
    category: { id: "3", name: "Leather & Sports Gears", slug: "leather-sports-gears" },
    company: { id: "1", name: "Anchor Group", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Organic Brown Rice",
    shortDescription: "Premium quality organic brown rice, export grade",
    price: { amount: 850.0, currency: "USD", minOrderQuantity: 1 },
    images: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop"],
    category: { id: "1", name: "Agriculture", slug: "agriculture" },
    company: { id: "2", name: "Paktherm", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Surgical Needles",
    shortDescription: "High-quality surgical needles, sterilizable",
    price: { amount: 12.0, currency: "USD", minOrderQuantity: 10 },
    images: ["https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop"],
    category: { id: "4", name: "Surgical Instruments", slug: "surgical-instruments" },
    company: { id: "3", name: "Unicol", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Elegant Leather Gloves",
    shortDescription: "Premium leather gloves for sports and fashion",
    price: { amount: 18.0, currency: "USD", minOrderQuantity: 50 },
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop"],
    category: { id: "3", name: "Leather & Sports Gears", slug: "leather-sports-gears" },
    company: { id: "5", name: "MR. CRAFTS TREASURES", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "6",
    name: "Sharp Surgical Scissors",
    shortDescription: "Precision surgical scissors, high-grade stainless steel",
    price: { amount: 15.0, currency: "USD", minOrderQuantity: 20 },
    images: ["https://pak-exporters.com/wp-content/uploads/rem-41.webp"],
    category: { id: "4", name: "Surgical Instruments", slug: "surgical-instruments" },
    company: { id: "6", name: "ELA", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "7",
    name: "Sweet Pakistani Mangoes",
    shortDescription: "Fresh, export-quality Pakistani mangoes",
    price: { amount: 45.0, currency: "USD", minOrderQuantity: 1 },
    images: ["https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop"],
    category: { id: "1", name: "Agriculture", slug: "agriculture" },
    company: { id: "1", name: "Anchor Group", verified: true, goldSupplier: true, membershipTier: "gold" },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Trust Signals */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1, duration: 0.4 },
              },
            }}
          >
            <motion.div
              className="text-center"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">GLOBAL CONNECTIVITY</h3>
              <p className="text-muted-foreground text-sm">
                B2B Merchants - Connect with buyers worldwide
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="flex justify-center mb-4">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ADVERTISE WITH US</h3>
              <p className="text-muted-foreground text-sm">
                Target the Globe - Reach international markets
              </p>
            </motion.div>
            <motion.div
              className="text-center"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">ONLINE SUPPORT 24/7</h3>
              <p className="text-muted-foreground text-sm">
                Caring with Professionalism - Always here to help
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Pak-Exporters */}
      <section className="py-20 relative overflow-hidden">
        {/* Background gradient with glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Why Choose Pak-Exporters?
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Pakistan&apos;s First Export Marketplace - Powered by AI and built for global trade
            </p>
          </div>
          </FadeInOnScroll>

          {/* Tabbed Interface */}
          <Tabs defaultValue="benefits" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-12 bg-background/80 backdrop-blur-md border border-border/50 rounded-full p-1.5 shadow-lg">
              <TabsTrigger 
                value="benefits" 
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Core Benefits
              </TabsTrigger>
              <TabsTrigger 
                value="ai-features" 
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                AI Features
              </TabsTrigger>
            </TabsList>

            {/* Core Benefits Tab */}
            <TabsContent value="benefits" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    icon: Shield, 
                    title: "Verified Suppliers", 
                    description: "All suppliers undergo comprehensive verification. Our tiered membership system (Platinum, Gold, Silver, Starter) ensures you work with trusted partners.",
                    gradient: "from-blue-500 to-blue-600"
                  },
                  { 
                    icon: TrendingUp, 
                    title: "Global Reach", 
                    description: "Connect with buyers from around the world. Our platform facilitates international trade with tools designed for cross-border commerce.",
                    gradient: "from-green-500 to-green-600"
                  },
                  { 
                    icon: Zap, 
                    title: "Easy to Use", 
                    description: "Intuitive interface designed for both buyers and suppliers. List products, manage orders, and grow your business with ease.",
                    gradient: "from-yellow-500 to-orange-500"
                  },
                  { 
                    icon: BarChart3, 
                    title: "Advanced Analytics", 
                    description: "Track your performance with detailed analytics. Monitor views, inquiries, and sales to make data-driven business decisions.",
                    gradient: "from-purple-500 to-purple-600"
                  },
                  { 
                    icon: CheckCircle2, 
                    title: "Secure Transactions", 
                    description: "Built with security in mind. Your data and transactions are protected with industry-standard encryption and security practices.",
                    gradient: "from-emerald-500 to-teal-500"
                  },
                  { 
                    icon: Users, 
                    title: "24/7 Support", 
                    description: "Our dedicated support team is available around the clock to help you succeed. Get assistance whenever you need it.",
                    gradient: "from-indigo-500 to-indigo-600"
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 bg-gradient-to-br ${benefit.gradient} rounded-xl shadow-lg`}>
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-lg">{benefit.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* AI Features Tab */}
            <TabsContent value="ai-features" className="mt-0">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold">AI-Powered Features</h3>
                  <Badge variant="outline" className="ml-2 text-lg px-4 py-1">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                  We&apos;re building the future of B2B marketplaces with cutting-edge AI technology
                  to make your trading experience smarter and more efficient.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Sparkles, title: "AI Product Description Generator", gradient: "from-purple-500 to-pink-500" },
                  { icon: Zap, title: "AI Auto-Tagging & Categorization", gradient: "from-yellow-500 to-orange-500" },
                  { icon: Users, title: "AI Buyer-Supplier Matchmaking", gradient: "from-blue-500 to-cyan-500" },
                  { icon: Search, title: "AI Search Assistant", gradient: "from-green-500 to-emerald-500" },
                  { icon: Shield, title: "AI Trust & Verification Scores", gradient: "from-indigo-500 to-purple-500" },
                  { icon: BarChart3, title: "AI Insights Dashboard", gradient: "from-red-500 to-pink-500" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                        <feature.icon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="font-bold text-lg">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.title === "AI Product Description Generator" && "Automatically generate compelling, SEO-optimized product descriptions that highlight key features and benefits."}
                      {feature.title === "AI Auto-Tagging & Categorization" && "Upload products and let AI automatically tag and categorize them for better discoverability and organization."}
                      {feature.title === "AI Buyer-Supplier Matchmaking" && "Intelligent matching system that connects buyers with the most relevant suppliers based on requirements and preferences."}
                      {feature.title === "AI Search Assistant" && "Natural language search that understands context and intent, helping you find exactly what you're looking for."}
                      {feature.title === "AI Trust & Verification Scores" && "Advanced algorithms analyze supplier credibility, transaction history, and reviews to provide trust scores for informed decisions."}
                      {feature.title === "AI Insights Dashboard" && "Get actionable insights and recommendations powered by AI to optimize your listings, pricing, and business strategy."}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Membership CTA Section */}
      <MembershipCTASection />

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
              <p className="text-muted-foreground">
                Explore our wide range of product categories
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/categories">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredCategories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Products</h2>
              <p className="text-muted-foreground">
                Hot-selling products with high demand in the last 7 days
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trendingProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from Gold Suppliers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold">Featured Products</h2>
                <Badge variant="default" className="bg-yellow-500">
                  <Award className="h-4 w-4 mr-1" />
                  Gold Suppliers
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Premium products from verified Gold Supplier members
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/products?goldSupplierOnly=true">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <MembershipButton />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {featuredGoldProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Global Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Global Presence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pakistani exporters connecting with buyers across the globe
            </p>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-24 w-24 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
