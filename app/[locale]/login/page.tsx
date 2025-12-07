"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types/user";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const tToasts = useTranslations("auth.toasts");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Admin account: email "admin@admin.com", password "12345678"
      if (email.toLowerCase() === "admin@admin.com" && password === "12345678") {
        const adminUser: User = {
          id: "admin-1",
          email: "admin@admin.com",
          name: "Admin",
          role: "admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = "mock-jwt-token-admin-" + Date.now();
        login(adminUser, mockToken);
        toast.success(tCommon("success"));
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push(ROUTES.admin);
        router.refresh();
        return;
      }
      
      // Mock user data - replace with actual API response
      // In real app, this would come from API based on email/password
      // For demo: if email contains "supplier", create supplier user
      const isSupplier = email.toLowerCase().includes("supplier");
      const mockUser: User = {
        id: "1",
        email: email,
        name: email.split("@")[0] || "User",
        role: isSupplier ? "supplier" : "buyer",
        // Mock: suppliers need membership approval
        membershipStatus: isSupplier ? "pending" : undefined,
        membershipTier: isSupplier ? undefined : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const mockToken = "mock-jwt-token-" + Date.now();
      
      login(mockUser, mockToken);
      toast.success(tCommon("success"));
      
      // Small delay to ensure state is persisted before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // If supplier without approved membership, redirect to membership application
      if (isSupplier && mockUser.membershipStatus !== "approved") {
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
              {t("subtitle") || "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link
                    href={ROUTES.forgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("signingIn") : t("title")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t("noAccount")} </span>
              <Link href={ROUTES.register} className="text-primary hover:underline">
                {t("signUp")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

