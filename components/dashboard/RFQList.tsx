"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchRFQs, type FetchRFQsParams } from "@/services/api/rfq";
import type { RFQ } from "@/types/rfq";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, MessageSquare, Plus, Loader2, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

interface RFQListProps {
  userRole: "buyer" | "supplier";
}

export function RFQList({ userRole }: RFQListProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed" | "awarded" | "cancelled">("all");

  useEffect(() => {
    loadRFQs();
  }, [statusFilter, user]);

  const loadRFQs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params: FetchRFQsParams = {};
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (userRole === "buyer") {
        params.buyerId = user.id;
      } else if (userRole === "supplier") {
        // Suppliers see all open RFQs they can respond to
        params.status = "open";
      }

      const response = await fetchRFQs(params);
      setRfqs(response.rfqs);
    } catch (error) {
      toast.error("Failed to load RFQs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: RFQ["status"]) => {
    const variants: Record<RFQ["status"], "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      closed: "secondary",
      awarded: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {userRole === "buyer" ? "My RFQs" : "Available RFQs"}
            </CardTitle>
            <CardDescription>
              {rfqs.length} RFQ{rfqs.length !== 1 ? "s" : ""} {statusFilter !== "all" ? `(${statusFilter})` : ""}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {userRole === "buyer" && (
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All RFQs</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
            {userRole === "buyer" && (
              <Button asChild>
                <Link href={ROUTES.rfq}>
                  <Plus className="h-4 w-4 mr-2" />
                  New RFQ
                </Link>
              </Button>
            )}
            <Button onClick={loadRFQs} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rfqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {userRole === "buyer"
                ? "You haven't created any RFQs yet"
                : "No RFQs available at the moment"}
            </p>
            {userRole === "buyer" && (
              <Button asChild>
                <Link href={ROUTES.rfq}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First RFQ
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  {userRole === "buyer" && <TableHead>Responses</TableHead>}
                  <TableHead>Budget</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqs.map((rfq) => (
                  <TableRow key={rfq.id}>
                    <TableCell className="font-medium">{rfq.title}</TableCell>
                    <TableCell>{rfq.category.name}</TableCell>
                    {userRole === "buyer" && (
                      <TableCell>
                        <Badge variant="outline">
                          {rfq.responses?.length || 0} response{rfq.responses?.length !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {rfq.budget ? (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {rfq.budget.min && rfq.budget.max
                              ? `${rfq.budget.min.toLocaleString()} - ${rfq.budget.max.toLocaleString()}`
                              : rfq.budget.min
                              ? `${rfq.budget.min.toLocaleString()}+`
                              : `Up to ${rfq.budget.max?.toLocaleString()}`}{" "}
                            {rfq.budget.currency}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rfq.deadline ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(rfq.deadline)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No deadline</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`${ROUTES.dashboardRfq}/${rfq.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {userRole === "supplier" && rfq.status === "open" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`${ROUTES.dashboardRfq}/${rfq.id}/respond`)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

