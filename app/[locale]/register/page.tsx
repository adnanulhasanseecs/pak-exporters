"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types/user";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const tToasts = useTranslations("auth.toasts");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as "buyer" | "supplier",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("passwordMismatch") || "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Mock registration - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: "1",
        email: formData.email,
        name: formData.name,
        role: formData.role,
        // Suppliers need membership approval, buyers don't
        membershipStatus: formData.role === "supplier" ? "pending" : undefined,
        membershipTier: formData.role === "supplier" ? undefined : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = "mock-jwt-token-" + Date.now();
      
      login(mockUser, mockToken);
      toast.success(tCommon("success"));
      
      // Small delay to ensure state is persisted before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // If supplier, create a basic membership application and redirect to complete it
      if (formData.role === "supplier") {
        // Note: We don't create an application here since the user needs to fill out the full form
        // The application will be created when they submit the membership application form
        toast.info(tToasts("completeMembership"));
        router.push(ROUTES.membershipApply);
      } else {
        router.push(ROUTES.dashboard);
      }
      router.refresh();
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>
              {t("subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("role")}</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as "buyer" | "supplier" })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="cursor-pointer">
                      {t("buyer")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supplier" id="supplier" />
                    <Label htmlFor="supplier" className="cursor-pointer">
                      {t("supplier")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("creatingAccount") : t("title")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t("haveAccount")} </span>
              <Link href={ROUTES.login} className="text-primary hover:underline">
                {t("signIn")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

