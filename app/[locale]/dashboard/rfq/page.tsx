"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { RFQList } from "@/components/dashboard/RFQList";
import { AIMatchmaking } from "@/components/placeholders/AIMatchmaking";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { loadRFQsFromStorageOnInit } from "@/services/api/rfq";

export default function RFQDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Initialize RFQs in localStorage
    loadRFQsFromStorageOnInit();

    // Check authentication
    if (!user) {
      toast.error("Please log in to access RFQ dashboard");
      router.push(ROUTES.login);
      return;
    }

    // Only buyers and suppliers can access RFQ dashboard
    if (user.role !== "buyer" && user.role !== "supplier") {
      toast.error("RFQ dashboard is only available for buyers and suppliers");
      router.push(ROUTES.dashboard);
      return;
    }
  }, [user, router]);

  if (!user || (user.role !== "buyer" && user.role !== "supplier")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {user.role === "buyer" ? "My RFQs" : "Available RFQs"}
        </h1>
        <p className="text-muted-foreground">
          {user.role === "buyer"
            ? "Manage your requests for quotations and view supplier responses"
            : "Browse open RFQs and submit your quotes"}
        </p>
      </div>

      {user.role === "buyer" && (
        <div className="mb-8">
          <AIMatchmaking
            potentialMatches={0}
            onMatch={() => {
              // Placeholder - would trigger matchmaking
            }}
          />
        </div>
      )}

      <RFQList userRole={user.role} />
    </div>
  );
}

