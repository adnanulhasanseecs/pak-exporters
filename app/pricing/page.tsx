import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Pricing - Redirecting",
  description: "Redirecting to membership tiers",
};

export default function PricingPage() {
  redirect(ROUTES.membership);
  // redirect() throws an exception in Next.js, so this return is unreachable
  // but included for type safety and clarity
  return null;
}
