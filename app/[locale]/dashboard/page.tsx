"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { ROUTES } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (user?.role === "admin") {
      router.push(ROUTES.admin);
    }
  }, [user, router]);

  // Don't render dashboard for admin users
  if (user?.role === "admin") {
    return null;
  }

  return <DashboardContent />;
}
