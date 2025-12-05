"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchRFQ, submitRFQResponse } from "@/services/api/rfq";
import { fetchCategory } from "@/services/api/categories";
import type { RFQ } from "@/types/rfq";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

export default function RFQRespondPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
    currency: "USD",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rfqId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (user.role !== "supplier") {
      toast.error("Only suppliers can respond to RFQs");
      router.push(ROUTES.dashboardRfq);
      return;
    }
    loadRFQ();
  }, [rfqId, user]);

  const loadRFQ = async () => {
    setLoading(true);
    try {
      const rfqData = await fetchRFQ(rfqId);
      if (!rfqData) {
        toast.error("RFQ not found");
        router.push(ROUTES.dashboardRfq);
        return;
      }

      if (rfqData.status !== "open") {
        toast.error("This RFQ is no longer open for responses");
        router.push(ROUTES.dashboardRfqDetail(rfqId));
        return;
      }

      // Populate category name if missing
      if (rfqData.category && !rfqData.category.name) {
        const category = await fetchCategory(rfqData.category.id);
        if (category) {
          rfqData.category.name = category.name;
          rfqData.category.slug = category.slug;
        }
      }

      // Set default currency from RFQ budget if available
      if (rfqData.budget) {
        setFormData((prev) => ({
          ...prev,
          currency: rfqData.budget!.currency,
        }));
      }

      setRfq(rfqData);
    } catch (error) {
      toast.error("Failed to load RFQ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "supplier" || !rfq) {
      return;
    }

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.price.trim() || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await submitRFQResponse(
        rfqId,
        user.id,
        user.name,
        user.companyId || "Unknown Company", // In real app, get from user profile
        {
          amount: parseFloat(formData.price),
          currency: formData.currency,
        },
        formData.message || undefined
      );

      toast.success("Response submitted successfully!");
      router.push(ROUTES.dashboardRfqDetail(rfqId));
    } catch (error) {
      toast.error("Failed to submit response. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!rfq) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(ROUTES.dashboardRfqDetail(rfqId))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to RFQ Details
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Respond to RFQ</h1>
          <p className="text-muted-foreground">
            Submit your quote for: <span className="font-semibold">{rfq.title}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>RFQ Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Category:</span> {rfq.category.name}
              </p>
              {rfq.quantity && (
                <p>
                  <span className="font-medium">Quantity:</span>{" "}
                  {rfq.quantity.min && rfq.quantity.max
                    ? `${rfq.quantity.min.toLocaleString()} - ${rfq.quantity.max.toLocaleString()}`
                    : rfq.quantity.min
                    ? `${rfq.quantity.min.toLocaleString()}+`
                    : `Up to ${rfq.quantity.max?.toLocaleString()}`}{" "}
                  {rfq.quantity.unit}
                </p>
              )}
              {rfq.budget && (
                <p>
                  <span className="font-medium">Budget Range:</span>{" "}
                  {rfq.budget.min && rfq.budget.max
                    ? `${rfq.budget.min.toLocaleString()} - ${rfq.budget.max.toLocaleString()}`
                    : rfq.budget.min
                    ? `${rfq.budget.min.toLocaleString()}+`
                    : `Up to ${rfq.budget.max?.toLocaleString()}`}{" "}
                  {rfq.budget.currency}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Quote</CardTitle>
            <CardDescription>
              Provide your pricing and any additional information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="PKR">PKR</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      if (errors.price) setErrors({ ...errors, price: "" });
                    }}
                    className={errors.price ? "border-destructive" : ""}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add any additional information about your quote, delivery terms, etc."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.dashboardRfqDetail(rfqId))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quote"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

