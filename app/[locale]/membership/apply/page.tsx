"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle2, Star, Award, Shield, Sparkles, Upload, File, Info } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { createMembershipApplication } from "@/services/api/membership";
import { useAuthStore } from "@/store/useAuthStore";

const membershipTiers = [
  {
    value: "starter",
    name: "Starter",
    icon: Sparkles,
    description: "Perfect for new businesses starting their export journey",
    color: "text-blue-600",
    badgeColor: "bg-blue-500",
    features: [
      "Basic product listings",
      "Company profile page",
      "Email support",
      "Access to buyer inquiries",
    ],
  },
  {
    value: "silver",
    name: "Silver Supplier",
    icon: Shield,
    description: "For established businesses with proven track record",
    color: "text-slate-600",
    badgeColor: "bg-slate-400",
    features: [
      "Enhanced visibility in search",
      "Product listing management",
      "Basic analytics dashboard",
      "Priority email support",
      "Monthly performance reports",
    ],
  },
  {
    value: "gold",
    name: "Gold Supplier",
    icon: Award,
    description: "Verified suppliers with excellent track records",
    color: "text-yellow-600",
    badgeColor: "bg-yellow-500",
    features: [
      "Premium placement in search results",
      "Featured product placement",
      "Advanced analytics dashboard",
      "Priority customer support",
      "Trade show participation opportunities",
    ],
  },
  {
    value: "platinum",
    name: "Platinum Supplier",
    icon: Star,
    description: "Our highest tier for the most trusted suppliers",
    color: "text-gray-600",
    badgeColor: "bg-gray-500",
    features: [
      "Premium placement in search results",
      "Featured placement on homepage",
      "Priority customer support",
      "Advanced analytics dashboard",
      "Dedicated account manager",
      "Exclusive trade show invitations",
    ],
  },
];

const formSchema = z.object({
  membershipTier: z.enum(["starter", "silver", "gold", "platinum"], {
    message: "Please select a membership tier",
  }),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  businessRegistrationNumber: z.string().min(1, "Business registration number is required"),
  yearEstablished: z.string().min(4, "Please enter a valid year"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  country: z.string().min(2, "Country is required"),
  mainProducts: z.string().min(10, "Please describe your main products"),
  numberOfEmployees: z.string().min(1, "Please select number of employees"),
  annualRevenue: z.string().min(1, "Please select annual revenue range"),
  certifications: z.array(z.string()).optional(),
  previousExperience: z.string().min(10, "Please describe your export experience"),
  references: z.string().optional(),
  additionalInfo: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function MembershipApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "Pakistan",
      certifications: [],
    },
  });

  const selectedTier = watch("membershipTier");
  const certifications = watch("certifications") || [];

  const toggleCertification = (cert: string) => {
    const current = certifications || [];
    if (current.includes(cert)) {
      setValue("certifications", current.filter((c) => c !== cert));
    } else {
      setValue("certifications", [...current, cert]);
    }
  };

  const { user } = useAuthStore();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("Please log in to submit an application");
      router.push(ROUTES.login);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create membership application
      await createMembershipApplication(
        user.id,
        user.email,
        user.name,
        {
          membershipTier: data.membershipTier,
          companyName: data.companyName,
          businessRegistrationNumber: data.businessRegistrationNumber,
          yearEstablished: data.yearEstablished,
          email: data.email,
          phone: data.phone,
          website: data.website || undefined,
          address: data.address,
          city: data.city,
          province: data.province,
          country: data.country,
          mainProducts: data.mainProducts,
          numberOfEmployees: data.numberOfEmployees,
          annualRevenue: data.annualRevenue || undefined,
          exportMarkets: undefined, // Not in form schema yet
          certifications: data.certifications || undefined,
          businessLicenseDocument: businessLicenseFile?.name || undefined,
          certificationDocuments: certificationFiles.map((f) => f.name) || undefined,
          companyDescription: data.additionalInfo || undefined, // Use additionalInfo as company description
          previousExperience: data.previousExperience || undefined,
        }
      );
      
      toast.success("Application submitted successfully!", {
        description: "Our business verification team will contact you for further clarification and may request additional documents.",
      });
      router.push("/membership/apply/success");
    } catch (error) {
      toast.error("Failed to submit application", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Apply for Supplier Membership</h1>
        <p className="text-muted-foreground">
          Join Pak-Exporters and connect with global buyers. Complete the form below to get started.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                <span className="text-xs mt-2 text-muted-foreground">
                  {s === 1 ? "Tier Selection" : s === 2 ? "Company Info" : "Additional Details"}
                </span>
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Membership Tier Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Select Membership Tier</CardTitle>
                  <CardDescription>
                    Choose the membership tier that best fits your business needs
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.membership}>
                    <Info className="h-4 w-4 mr-2" />
                    Learn More About Tiers
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedTier}
                onValueChange={(value) => setValue("membershipTier", value as any)}
                className="space-y-4"
              >
                {membershipTiers.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.value;
                  return (
                    <div key={tier.value} className="relative">
                      <Label
                        htmlFor={tier.value}
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-all ${
                          isSelected ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setValue("membershipTier", tier.value as any)}
                      >
                        <RadioGroupItem
                          value={tier.value}
                          id={tier.value}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className={`${tier.color} mt-1`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{tier.name}</h3>
                            <Badge className={tier.badgeColor}>{tier.name}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                          <ul className="text-sm space-y-1">
                            {tier.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {errors.membershipTier && (
                <p className="text-sm text-destructive mt-2">{errors.membershipTier.message}</p>
              )}
              <div className="flex justify-end mt-6">
                <Button type="button" onClick={nextStep} disabled={!selectedTier}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Company Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell us about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...register("companyName")}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
                  <Input
                    id="businessRegistrationNumber"
                    {...register("businessRegistrationNumber")}
                    placeholder="Enter registration number"
                  />
                  {errors.businessRegistrationNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.businessRegistrationNumber.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="businessLicense">Business License Document (Optional)</Label>
                  </div>
                  <input
                    type="file"
                    id="businessLicense"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setBusinessLicenseFile(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById("businessLicense")?.click()}
                    title="Upload Business License"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {businessLicenseFile && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <File className="h-3 w-3" />
                      {businessLicenseFile.name.length > 20 ? `${businessLicenseFile.name.substring(0, 20)}...` : businessLicenseFile.name}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearEstablished">Year Established *</Label>
                  <Input
                    id="yearEstablished"
                    type="number"
                    {...register("yearEstablished")}
                    placeholder="e.g., 2019"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.yearEstablished && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.yearEstablished.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
                  <Select
                    onValueChange={(value) => setValue("numberOfEmployees", value)}
                    defaultValue={watch("numberOfEmployees")}
                  >
                    <SelectTrigger id="numberOfEmployees">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.numberOfEmployees && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.numberOfEmployees.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="annualRevenue">Annual Revenue (USD) *</Label>
                  <Select
                    onValueChange={(value) => setValue("annualRevenue", value)}
                    defaultValue={watch("annualRevenue")}
                  >
                    <SelectTrigger id="annualRevenue">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-100k">$0 - $100,000</SelectItem>
                      <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                      <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                      <SelectItem value="5m+">$5,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.annualRevenue && (
                    <p className="text-sm text-destructive mt-1">{errors.annualRevenue.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="mainProducts">Main Products/Services *</Label>
                <Textarea
                  id="mainProducts"
                  {...register("mainProducts")}
                  placeholder="Describe your main products or services"
                  rows={4}
                />
                {errors.mainProducts && (
                  <p className="text-sm text-destructive mt-1">{errors.mainProducts.message}</p>
                )}
              </div>

              <div>
                <Label>Certifications (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {["ISO 9001", "ISO 14001", "HACCP", "Halal", "CE", "FDA"].map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={certifications.includes(cert)}
                        onCheckedChange={() => toggleCertification(cert)}
                      />
                      <Label htmlFor={cert} className="text-sm font-normal cursor-pointer">
                        {cert}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="certificationDocs">Certification Documents (Optional)</Label>
                    <input
                      type="file"
                      id="certificationDocs"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) setCertificationFiles(files);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => document.getElementById("certificationDocs")?.click()}
                      title="Upload Certification Documents"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {certificationFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {certificationFiles.map((file, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                          <File className="h-3 w-3" />
                          {file.name.length > 30 ? `${file.name.substring(0, 30)}...` : file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact & Additional Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Additional Information</CardTitle>
              <CardDescription>Provide your contact details and additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="company@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+92 321 1234567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    {...register("website")}
                    placeholder="https://www.example.com"
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive mt-1">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Street address"
                  rows={2}
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} placeholder="City" />
                  {errors.city && (
                    <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Input id="province" {...register("province")} placeholder="Province" />
                  {errors.province && (
                    <p className="text-sm text-destructive mt-1">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...register("country")} placeholder="Country" />
                  {errors.country && (
                    <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="previousExperience">Export Experience *</Label>
                <Textarea
                  id="previousExperience"
                  {...register("previousExperience")}
                  placeholder="Describe your experience in export business, key markets, etc."
                  rows={4}
                />
                {errors.previousExperience && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.previousExperience.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="references">References (Optional)</Label>
                <Textarea
                  id="references"
                  {...register("references")}
                  placeholder="Previous clients or business partners who can vouch for your business"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  {...register("additionalInfo")}
                  placeholder="Any additional information you'd like to share"
                  rows={3}
                />
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="agreeToTerms"
                  checked={watch("agreeToTerms")}
                  onCheckedChange={(checked) => setValue("agreeToTerms", checked === true)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary underline">
                    Privacy Policy
                  </a>
                  *
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
              )}

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

