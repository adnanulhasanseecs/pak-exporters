import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Application Submitted Successfully",
  description: "Your membership application has been submitted successfully",
};

export default function MembershipApplySuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl">Application Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for applying to become a supplier member on Pak-Exporters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Our business verification team will review your application and contact you for further clarification.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  We may request additional documents or information to complete the verification process.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Once approved, you'll receive access to your supplier dashboard.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  You can start listing your products and connecting with global buyers.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Need help?</strong> If you have any questions about your application, please
              contact us at{" "}
              <a href="mailto:admin@pak-exporters.com" className="underline">
                admin@pak-exporters.com
              </a>{" "}
              or call{" "}
              <a href="tel:+923219555507" className="underline">
                +92 321 9555507
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href={ROUTES.home}>Back to Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.membership}>Learn More About Tiers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

