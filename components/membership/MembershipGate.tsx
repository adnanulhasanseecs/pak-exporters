"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { canUploadProducts, getMembershipStatusMessage } from "@/lib/membership";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface MembershipGateProps {
  children: React.ReactNode;
  redirect?: boolean;
}

/**
 * Component that gates content behind membership approval
 * For suppliers, requires approved membership
 * For buyers, redirects to register as supplier
 */
export function MembershipGate({ children, redirect = true }: MembershipGateProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const canAccess = canUploadProducts(user);

  useEffect(() => {
    if (redirect && !canAccess) {
      if (!user) {
        // Not logged in - redirect to registration
        toast.info("Please create an account to upload products");
        router.push(ROUTES.register);
        return;
      }
      
      if (user.role === "buyer") {
        // Buyer trying to access - redirect to register as supplier
        toast.info("You need a supplier account to upload products. Please register as a supplier.");
        router.push(ROUTES.register);
        return;
      }
      
      // Supplier without approved membership
      const message = getMembershipStatusMessage(user);
      toast.error(message || "Please complete your membership application");
      router.push(ROUTES.membershipApply);
    }
  }, [canAccess, user, redirect, router]);

  if (redirect && !canAccess) {
    return null; // Will redirect, so return nothing
  }

  if (!redirect && !canAccess && user) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Membership Required</CardTitle>
          </div>
          <CardDescription>{getMembershipStatusMessage(user)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(ROUTES.membershipApply)}>
            Apply for Membership
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

