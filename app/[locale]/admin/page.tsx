"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslations } from "next-intl";
import {
  fetchMembershipApplications,
  approveMembershipApplication,
  rejectMembershipApplication,
  loadApplicationsFromStorage,
} from "@/services/api/membership";
import type { MembershipApplication } from "@/types/membership";
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
import { CheckCircle2, XCircle, Eye, Loader2, Users, Clock, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [allApplications, setAllApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Load all applications
      const response = await fetchMembershipApplications();
      setAllApplications(response.applications);
      
      // Filter based on selected status
      if (statusFilter === "all") {
        setApplications(response.applications);
      } else {
        setApplications(response.applications.filter(app => app.status === statusFilter));
      }
    } catch (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      router.push(ROUTES.login);
      toast.error("Admin access required");
      return;
    }

    // Load applications from localStorage on mount
    loadApplicationsFromStorage();
    loadApplications();
    
    // Set up interval to refresh applications every 5 seconds
    const interval = setInterval(() => {
      loadApplicationsFromStorage();
      loadApplications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, router, loadApplications]);

  const handleApprove = async (applicationId: string) => {
    if (!user) return;

    setProcessing(applicationId);
    try {
      await approveMembershipApplication(applicationId, user.id);
      toast.success(tCommon("success"));
      await loadApplications();
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !user) return;

    setProcessing(selectedApplication.id);
    try {
      await rejectMembershipApplication(
        selectedApplication.id,
        user.id,
        rejectionReason || undefined
      );
      toast.success(tCommon("success"));
      setRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason("");
      await loadApplications();
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const openRejectDialog = (application: MembershipApplication) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  // Calculate stats
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => app.status === "pending").length,
    approved: allApplications.filter(app => app.status === "approved").length,
    rejected: allApplications.filter(app => app.status === "rejected").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title") || "Admin Dashboard"}</h1>
        <p className="text-muted-foreground">
          {t("subtitle") || "Review and manage membership applications"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalApplications") || "Total Applications"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t("allTime") || "All time"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pending")}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">{t("awaitingReview") || "Awaiting review"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("approved")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">{t("accepted") || "Accepted"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("rejected")}</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">{t("declined") || "Declined"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membership Applications</CardTitle>
              <CardDescription>
                {applications.length} application{applications.length !== 1 ? "s" : ""} {statusFilter !== "all" ? `(${statusFilter})` : ""}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadApplications} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {statusFilter === "all" 
                  ? t("noApplicationsFound") || "No applications found"
                  : t("noStatusApplications", { status: statusFilter }) || `No ${statusFilter} applications`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>{app.userName}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {app.membershipTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              app.status === "pending"
                                ? "secondary"
                                : app.status === "approved"
                                ? "default"
                                : "destructive"
                            }
                            className="capitalize w-fit"
                          >
                            {app.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {app.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {app.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {app.status}
                          </Badge>
                          {app.reviewedAt && (
                            <span className="text-xs text-muted-foreground">
                              {t("reviewed") || "Reviewed"}: {new Date(app.reviewedAt).toLocaleDateString()}
                            </span>
                          )}
                          {app.rejectionReason && app.status === "rejected" && (
                            <span className="text-xs text-red-600 italic max-w-xs truncate" title={app.rejectionReason}>
                              {t("reason") || "Reason"}: {app.rejectionReason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {tCommon("view")}
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(app.id)}
                                disabled={processing === app.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {processing === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    {t("approve")}
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openRejectDialog(app)}
                                disabled={processing === app.id}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {processing === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    {t("reject")}
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {app.status === "approved" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t("approved")}
                            </Badge>
                          )}
                          {app.status === "rejected" && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t("rejected")}
                            </Badge>
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

      {/* Application Details Modal - Expanded View */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication && !rejectDialogOpen} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details - {selectedApplication.companyName}</DialogTitle>
              <DialogDescription>
                Submitted on {new Date(selectedApplication.submittedAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Applicant Name</Label>
                  <p className="text-sm">{selectedApplication.userName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <p className="text-sm">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Membership Tier</Label>
                  <Badge className="capitalize">{selectedApplication.membershipTier}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Business Registration Number</Label>
                  <p className="text-sm">{selectedApplication.businessRegistrationNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Year Established</Label>
                  <p className="text-sm">{selectedApplication.yearEstablished}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Number of Employees</Label>
                  <p className="text-sm">{selectedApplication.numberOfEmployees}</p>
                </div>
                {selectedApplication.website && (
                  <div>
                    <Label className="text-sm font-semibold">Website</Label>
                    <p className="text-sm">
                      <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {selectedApplication.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold">Address</Label>
                <p className="text-sm">
                  {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.province}, {selectedApplication.country}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Main Products</Label>
                <p className="text-sm">{selectedApplication.mainProducts}</p>
              </div>
              {selectedApplication.previousExperience && (
                <div>
                  <Label className="text-sm font-semibold">Export Experience</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedApplication.previousExperience}</p>
                </div>
              )}
              {selectedApplication.businessLicenseDocument && (
                <div>
                  <Label className="text-sm font-semibold">Business License</Label>
                  <p className="text-sm text-muted-foreground">{selectedApplication.businessLicenseDocument}</p>
                </div>
              )}
              {selectedApplication.certificationDocuments && selectedApplication.certificationDocuments.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Certifications</Label>
                  <ul className="text-sm list-disc list-inside">
                    {selectedApplication.certificationDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => handleApprove(selectedApplication.id)}
                disabled={processing === selectedApplication.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing === selectedApplication.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedApplication(null);
                  openRejectDialog(selectedApplication);
                }}
                disabled={processing === selectedApplication.id}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? You can provide a reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialogOpen(false);
              setRejectionReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={!!processing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

