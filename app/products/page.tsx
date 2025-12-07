import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware products page
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  
  // Build query string from search params
  const queryString = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => queryString.append(key, v));
      } else {
        queryString.append(key, value);
      }
    }
  });
  
  const query = queryString.toString();
  redirect(`/${defaultLocale}/products${query ? `?${query}` : ""}`);
  
  // redirect() throws, so this is unreachable but needed for TypeScript
  return null;
}
