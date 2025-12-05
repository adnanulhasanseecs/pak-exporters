"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { fetchMembershipApplications } from "@/services/api/membership";

export function MembershipCTASection() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadPendingApplications = async () => {
      if (!user || user.role !== "admin") {
        return;
      }
      try {
        const response = await fetchMembershipApplications({ status: "pending" });
        setPendingCount(response.total);
      } catch {
        setPendingCount(null);
      }
    };

    loadPendingApplications();
  }, [user]);

  if (!mounted) {
    return null;
  }

  // Admin: show pending membership info instead of supplier CTA
  if (user?.role === "admin") {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
            <CardContent className="p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">Membership Approvals</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3 max-w-xl">
                  You are logged in as an administrator. Use the admin dashboard to review and approve or reject supplier membership applications.
                </p>
                <p className="text-sm text-muted-foreground">
                  {pendingCount === null
                    ? "Pending applications will appear in your admin dashboard."
                    : pendingCount === 0
                    ? "There are currently no pending membership applications."
                    : `You currently have ${pendingCount} pending membership application${
                        pendingCount > 1 ? "s" : ""
                      } waiting for your review.`}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto md:items-end">
                <Button size="lg" asChild>
                  <Link href={ROUTES.admin}>
                    Go to Admin Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Check if user is a supplier with pending membership
  const isSupplier = user?.role === "supplier";
  const membershipStatus = user?.membershipStatus;
  const isPending = membershipStatus === "pending";
  const isApproved = membershipStatus === "approved";
  const isRejected = membershipStatus === "rejected";

  // Don't show anything if user is approved (they're already a member)
  if (isSupplier && isApproved) {
    return null;
  }

  // Show pending status message
  if (isSupplier && isPending) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">Membership Application Under Review</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Thank you for submitting your membership application. Our verification team is currently reviewing your application and will contact you soon for any additional information needed.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Application submitted successfully</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Show rejected status message
  if (isSupplier && isRejected) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-red-200 dark:border-red-800 bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">Membership Application Status</h3>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Your membership application was not approved. Please review your application or contact support for more information.
                  </p>
                  <Button asChild variant="outline">
                    <Link href={ROUTES.membershipApply}>
                      Review Application <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Default CTA for non-members or buyers
  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Become a Supplier Member</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Pak-Exporters as a supplier and showcase your products to global buyers. Choose from
            Platinum, Gold, or Silver membership tiers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={ROUTES.membershipApply}>
                Apply for Membership <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={ROUTES.membership}>
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

