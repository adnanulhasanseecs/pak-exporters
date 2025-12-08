"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { Mail, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTranslations } from "next-intl";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.verifyEmail");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">("pending");

  useEffect(() => {
    // Check if token is present in URL (from email link)
    const urlToken = searchParams.get("token");
    if (urlToken) {
      handleVerify(urlToken);
    }
  }, [searchParams]);

  const handleVerify = async (_verifyToken: string) => {
    setStatus("verifying");

    try {
      // Mock: Verify email token (in real app, use _verifyToken)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate for demo

      if (success) {
        setStatus("success");
        toast.success(tCommon("success"));
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(ROUTES.dashboard);
        }, 2000);
      } else {
        setStatus("error");
        toast.error(tCommon("error"));
      }
    } catch (error) {
      setStatus("error");
      toast.error(tCommon("error"));
      console.error(error);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      // Mock: Resend verification email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(tCommon("success"));
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">
            {status === "pending" && t("subtitle")}
            {status === "verifying" && (t("verifying") || "Verifying your email...")}
            {status === "success" && (t("success") || "Email verified successfully!")}
            {status === "error" && (t("error") || "Verification failed")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("cardTitle") || "Email Verification"}</CardTitle>
            <CardDescription>
              {status === "pending" && (t("pendingDescription") || "Check your email for a verification link")}
              {status === "verifying" && (t("verifyingDescription") || "Please wait while we verify your email")}
              {status === "success" && (t("successDescription") || "Your email has been verified")}
              {status === "error" && (t("errorDescription") || "The verification link is invalid or expired")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "pending" && (
              <>
                <div className="text-center py-6">
                  <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("emailSentMessage") || "We've sent a verification link to your email address. Please click the link in the email to verify your account."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("noEmailMessage") || "Didn't receive the email? Check your spam folder or resend the verification email."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleResend}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{tCommon("loading")}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("resend")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(ROUTES.dashboard)}
                    className="w-full"
                  >
                    {t("continueToDashboard") || "Continue to Dashboard"}
                  </Button>
                </div>
              </>
            )}

            {status === "verifying" && (
              <div className="text-center py-6">
                <LoadingSpinner size="lg" text={t("verifying") || "Verifying your email..."} />
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("successRedirect") || "Your email has been successfully verified. Redirecting to dashboard..."}
                </p>
                <Button onClick={() => router.push(ROUTES.dashboard)} className="w-full">
                  {t("goToDashboard") || "Go to Dashboard"}
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-6">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("errorMessage") || "The verification link is invalid or has expired. Please request a new verification email."}
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleResend}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{tCommon("loading")}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("resend")}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(ROUTES.login)}
                    className="w-full"
                  >
                    {t("backToLogin") || "Back to Login"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

