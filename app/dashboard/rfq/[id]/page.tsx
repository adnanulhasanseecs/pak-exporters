"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchRFQ, updateRFQResponseStatus, updateRFQStatus } from "@/services/api/rfq";
import { fetchCategory } from "@/services/api/categories";
import type { RFQ } from "@/types/rfq";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, ArrowLeft, Calendar, DollarSign, Package, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function RFQDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const rfqId = params.id as string;

  const loadRFQ = useCallback(async () => {
    setLoading(true);
    try {
      const rfqData = await fetchRFQ(rfqId);
      if (!rfqData) {
        toast.error("RFQ not found");
        router.push(ROUTES.dashboardRfq);
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

      setRfq(rfqData);
    } catch (error) {
      toast.error("Failed to load RFQ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [rfqId, router]);

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    loadRFQ();
  }, [rfqId, user, router, loadRFQ]);

  const handleAcceptResponse = async (responseId: string) => {
    if (!rfq || !user) return;

    setProcessing(responseId);
    try {
      await updateRFQResponseStatus(rfqId, responseId, "accepted");
      toast.success("Response accepted successfully");
      await loadRFQ();
    } catch (error) {
      toast.error("Failed to accept response");
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectResponse = async (responseId: string) => {
    if (!rfq || !user) return;

    setProcessing(responseId);
    try {
      await updateRFQResponseStatus(rfqId, responseId, "rejected");
      toast.success("Response rejected");
      await loadRFQ();
    } catch (error) {
      toast.error("Failed to reject response");
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const handleCloseRFQ = async () => {
    if (!rfq || !user) return;

    setProcessing("close");
    try {
      await updateRFQStatus(rfqId, "closed");
      toast.success("RFQ closed");
      await loadRFQ();
    } catch (error) {
      toast.error("Failed to close RFQ");
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading RFQ details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return null;
  }

  const isBuyer = user?.role === "buyer" && user?.id === rfq.buyer.id;
  const isSupplier = user?.role === "supplier";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(ROUTES.dashboardRfq)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to RFQs
        </Button>
      </div>

      <div className="grid gap-6">
        {/* RFQ Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{rfq.title}</CardTitle>
                  <Badge
                    variant={
                      rfq.status === "open"
                        ? "default"
                        : rfq.status === "awarded"
                        ? "default"
                        : rfq.status === "closed"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {rfq.status}
                  </Badge>
                </div>
                <CardDescription>
                  Category: {rfq.category.name} • Created {new Date(rfq.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              {isBuyer && rfq.status === "open" && (
                <Button
                  variant="outline"
                  onClick={handleCloseRFQ}
                  disabled={!!processing}
                >
                  Close RFQ
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{rfq.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rfq.quantity && (
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-sm text-muted-foreground">
                      {rfq.quantity.min && rfq.quantity.max
                        ? `${rfq.quantity.min.toLocaleString()} - ${rfq.quantity.max.toLocaleString()}`
                        : rfq.quantity.min
                        ? `${rfq.quantity.min.toLocaleString()}+`
                        : `Up to ${rfq.quantity.max?.toLocaleString()}`}{" "}
                      {rfq.quantity.unit}
                    </p>
                  </div>
                </div>
              )}

              {rfq.budget && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-muted-foreground">
                      {rfq.budget.min && rfq.budget.max
                        ? `${rfq.budget.min.toLocaleString()} - ${rfq.budget.max.toLocaleString()}`
                        : rfq.budget.min
                        ? `${rfq.budget.min.toLocaleString()}+`
                        : `Up to ${rfq.budget.max?.toLocaleString()}`}{" "}
                      {rfq.budget.currency}
                    </p>
                  </div>
                </div>
              )}

              {rfq.deadline && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(rfq.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {rfq.specifications && Object.keys(rfq.specifications).length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(rfq.specifications).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span>{" "}
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Buyer Information</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">{rfq.buyer.name}</p>
                  {rfq.buyer.company && (
                    <p className="text-muted-foreground">{rfq.buyer.company}</p>
                  )}
                  <p className="text-muted-foreground">{rfq.buyer.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses Section */}
        {isBuyer && (
          <Card>
            <CardHeader>
              <CardTitle>Responses ({rfq.responses?.length || 0})</CardTitle>
              <CardDescription>
                Review and accept or reject supplier responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!rfq.responses || rfq.responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No responses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rfq.responses.map((response) => (
                    <Card key={response.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{response.supplier.company}</h4>
                            <p className="text-sm text-muted-foreground">
                              {response.supplier.name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              response.status === "accepted"
                                ? "default"
                                : response.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {response.status}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">
                              {response.price.amount.toLocaleString()} {response.price.currency}
                            </span>
                          </div>
                          {response.message && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                              {response.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Submitted {new Date(response.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {response.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptResponse(response.id)}
                              disabled={processing === response.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectResponse(response.id)}
                              disabled={processing === response.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Supplier Action */}
        {isSupplier && rfq.status === "open" && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Quote</CardTitle>
              <CardDescription>
                Provide your pricing and message to respond to this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={ROUTES.dashboardRfqRespond(rfqId)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Respond to RFQ
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

