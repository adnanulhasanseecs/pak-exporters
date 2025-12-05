"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface MembershipButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function MembershipButton({ variant = "default", size = "default" }: MembershipButtonProps) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} asChild>
        <Link href={ROUTES.membershipApply}>Become a Member</Link>
      </Button>
    );
  }

  // Check if user is a supplier with pending membership
  const isSupplier = user?.role === "supplier";
  const membershipStatus = user?.membershipStatus;
  const isPending = membershipStatus === "pending";
  const isApproved = membershipStatus === "approved";

  // Show pending badge if pending
  if (isSupplier && isPending) {
    return (
      <Button variant="outline" size={size} disabled>
        <Clock className="h-4 w-4 mr-2" />
        Application Pending
        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          Under Review
        </Badge>
      </Button>
    );
  }

  // Don't show button if approved
  if (isSupplier && isApproved) {
    return null;
  }

  // Default: Show "Become a Member" button
  return (
    <Button variant={variant} size={size} asChild>
      <Link href={ROUTES.membershipApply}>Become a Member</Link>
    </Button>
  );
}

