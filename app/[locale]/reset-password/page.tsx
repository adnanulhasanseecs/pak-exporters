"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { Lock, Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { isValidEmail } from "@/lib/validation";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.resetPassword");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    token: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if token is present in URL (from email link)
    const token = searchParams.get("token");
    if (token) {
      setStep("reset");
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = tValidation("required");
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = tValidation("email");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Mock: Send reset email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(tCommon("success"));
      
      // In real app, show message to check email
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = tValidation("required");
    } else if (formData.password.length < 8) {
      newErrors.password = tValidation("minLength", { min: 8 });
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tValidation("required");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tValidation("passwordMatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Mock: Reset password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(tCommon("success"));
      
      router.push(ROUTES.login);
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (step === "request") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("requestSubtitle") || "Enter your email address and we'll send you a link to reset your password"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("requestTitle") || "Request Password Reset"}</CardTitle>
              <CardDescription>
                {t("requestDescription") || "We'll send a password reset link to your email"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email") || "Email Address"}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{tCommon("loading")}</span>
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => router.push(ROUTES.login)}>
                  {t("backToLogin") || "Back to Login"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("setNewPassword") || "Set New Password"}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("description") || "Choose a strong password for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t("passwordHint") || "Must be at least 8 characters long"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">{tCommon("loading")}</span>
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push(ROUTES.login)}>
                {t("backToLogin") || "Back to Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

