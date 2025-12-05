"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.login);
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Don't show sidebar for admin users
  if (user.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

