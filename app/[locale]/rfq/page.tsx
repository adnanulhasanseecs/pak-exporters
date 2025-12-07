"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { fetchCategories } from "@/services/api/categories";
import { createRFQ } from "@/services/api/rfq";
import type { Category } from "@/types/category";
import { useTranslations } from "next-intl";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import Image from "next/image";
import {
  FileText,
  Package,
  DollarSign,
  Calendar,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

export default function RFQPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations("rfq");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    quantity: "",
    budget: "",
    currency: "USD",
    deadline: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories on mount
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!user) {
      toast.error(t("loginRequired") || "Please log in to submit an RFQ");
      router.push(ROUTES.login);
      return;
    }
    if (user.role !== "buyer") {
      toast.error(t("buyersOnly") || "Only buyers can submit RFQs");
      router.push(ROUTES.dashboard);
      return;
    }
  }, [user, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== "buyer") {
      toast.error("Please log in as a buyer to submit RFQs");
      router.push(ROUTES.login);
      return;
    }
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = tValidation("required");
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = tValidation("required");
    }
    
    if (!formData.description.trim()) {
      newErrors.description = tValidation("required");
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("fillRequiredFields") || "Please fill in all required fields");
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const category = categories.find((c) => c.id === formData.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      await createRFQ(
        user.id,
        user.name,
        user.email,
        undefined, // buyerCompany - can be added to user type later
        {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          quantity: formData.quantity
            ? {
                min: parseInt(formData.quantity),
                max: parseInt(formData.quantity) * 1.2, // Estimate max
                unit: "pieces",
              }
            : undefined,
          budget: formData.budget
            ? {
                min: parseFloat(formData.budget) * 0.8,
                max: parseFloat(formData.budget) * 1.2,
                currency: formData.currency,
              }
            : undefined,
          deadline: formData.deadline || undefined,
        }
      );
      
      toast.success(t("submittedSuccess") || "RFQ submitted successfully!");
      router.push(ROUTES.dashboardRfq);
    } catch (error) {
      toast.error(t("submitFailed") || "Failed to submit RFQ. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop&q=80"
            alt="Business consultation and documents"
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
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary to-primary/60 rounded-2xl shadow-lg">
                  <FileText className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("title") || "Submit Request for Quotation"}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                {t("subtitle") || "Get competitive quotes from multiple suppliers"}
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t("detailsTitle") || "RFQ Details"}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {t("detailsDescription") || "Fill in the details below to receive quotes from suppliers"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="title" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {t("form.title") || "Title"} *
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Provide a clear, concise title that describes what you need. Example: "1000 Cotton T-Shirts - Bulk Order"</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          id="title"
                          placeholder={t("form.titlePlaceholder") || "e.g., Need 1000 cotton t-shirts"}
                          value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value });
                            if (errors.title) setErrors({ ...errors, title: "" });
                          }}
                          className={errors.title ? "border-destructive" : ""}
                        />
                        {errors.title && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <p>{errors.title}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="category" className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {t("form.category") || "Category"} *
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Select the product category that best matches your requirements. This helps suppliers find your RFQ.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => {
                            setFormData({ ...formData, categoryId: value });
                            if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                          }}
                        >
                          <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                            <SelectValue placeholder={t("form.categoryPlaceholder") || "Select a category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && (
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <p>{errors.categoryId}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="description" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {t("form.description") || "Description"} *
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Include detailed specifications: materials, sizes, colors, quality standards, certifications, and any special requirements.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Textarea
                          id="description"
                          placeholder={t("form.descriptionPlaceholder") || "Describe your requirements in detail..."}
                          value={formData.description}
                          onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            if (errors.description) setErrors({ ...errors, description: "" });
                          }}
                          rows={6}
                          className={errors.description ? "border-destructive" : ""}
                        />
                        <div className="flex items-center justify-between">
                          {errors.description ? (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="h-4 w-4" />
                              <p>{errors.description}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {formData.description.length} characters
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="quantity" className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              {t("form.quantity") || "Quantity"}
                            </Label>
                            <Badge variant="outline" className="text-xs">{tCommon("optional") || "Optional"}</Badge>
                          </div>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder={t("form.quantityPlaceholder") || "e.g., 1000"}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="deadline" className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              {t("form.deadline") || "Deadline"}
                            </Label>
                            <Badge variant="outline" className="text-xs">{tCommon("optional") || "Optional"}</Badge>
                          </div>
                          <Input
                            id="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="budget" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            {t("form.budget") || "Budget"}
                          </Label>
                          <Badge variant="outline" className="text-xs">{tCommon("optional") || "Optional"}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={formData.currency}
                            onValueChange={(value) => setFormData({ ...formData, currency: value })}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="PKR">PKR</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="budget"
                            type="number"
                            placeholder={t("form.budgetPlaceholder") || "Amount"}
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            {t("submitting") || "Submitting..."}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            {t("submit") || "Submit RFQ"}
                          </>
                        )}
                      </Button>
                    </form>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Tips for Success</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Be Specific</h4>
                        <p className="text-xs text-muted-foreground">
                          Include detailed specifications, materials, sizes, and quality requirements.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Set Realistic Budget</h4>
                        <p className="text-xs text-muted-foreground">
                          Providing a budget range helps suppliers give accurate quotes.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Timeline Matters</h4>
                        <p className="text-xs text-muted-foreground">
                          Specify your deadline to help suppliers assess feasibility.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg h-fit">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Review Responses</h4>
                        <p className="text-xs text-muted-foreground">
                          Compare quotes from multiple suppliers to find the best match.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> Your RFQ will be visible to verified suppliers in the selected category. You'll receive quotes within 24-48 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

