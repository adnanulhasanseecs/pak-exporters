"use client";

/**
 * Locale-Specific Error Handler
 * Catches errors that occur in locale-specific pages
 * 
 * This provides page-level isolation - errors in one locale don't break others
 */

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations("common");
  const router = useRouter();

  useEffect(() => {
    // Log error in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("Locale error handler caught error:", error);
      console.error("Error stack:", error.stack);
      if (error.digest) {
        console.error("Error digest:", error.digest);
      }
    }

    // In production, log to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">
              {t("error.title", { defaultValue: "Something went wrong" })}
            </CardTitle>
          </div>
          <CardDescription>
            {isDevelopment
              ? "An error occurred. Check the console for details."
              : t("error.description", {
                  defaultValue: "An unexpected error occurred. Please try again or contact support if the problem persists.",
                })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md space-y-2">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Error Message:
              </p>
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Stack Trace
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-900 rounded overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("error.tryAgain", { defaultValue: "Try Again" })}
            </Button>
            <Button onClick={() => router.back()} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("error.goBack", { defaultValue: "Go Back" })}
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href={ROUTES.home}>
                <Home className="h-4 w-4 mr-2" />
                {t("error.goHome", { defaultValue: "Home" })}
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("error.needHelp", { defaultValue: "Need help?" })}{" "}
              <Link href={ROUTES.contact} className="text-primary hover:underline">
                {t("error.contactSupport", { defaultValue: "Contact Support" })}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

