# Component Documentation

## Overview

This document provides an overview of the reusable components in the Pak-Exporters B2B Marketplace.

## Component Structure

Components are organized in the following directories:

- `components/ui/` - Base UI components (shadcn/ui)
- `components/layout/` - Layout components (Header, Footer, etc.)
- `components/cards/` - Card components (ProductCard, CompanyCard, etc.)
- `components/forms/` - Form components
- `components/accessibility/` - Accessibility components
- `components/pwa/` - PWA-related components

---

## Layout Components

### Header

**Location:** `components/layout/Header.tsx`

Main navigation header with:
- Logo and branding
- Desktop navigation menu
- Search bar
- User menu (when authenticated)
- Mobile menu

**Props:** None (uses Zustand store for auth state)

**Usage:**
```tsx
import { Header } from "@/components/layout/Header";

<Header />
```

### Footer

**Location:** `components/layout/Footer.tsx`

Site footer with:
- Company information
- Quick links
- Resources
- Contact information
- Social media links
- Keyboard shortcuts

**Props:** None

**Usage:**
```tsx
import { Footer } from "@/components/layout/Footer";

<Footer />
```

### Breadcrumb

**Location:** `components/ui/breadcrumb.tsx`

Navigation breadcrumb component.

**Props:**
- `items: Array<{ name: string; path: string }>` - Breadcrumb items

**Usage:**
```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb";

<Breadcrumb items={[
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Product Name", path: "/products/123" }
]} />
```

---

## Card Components

### ProductCard

**Location:** `components/cards/ProductCard.tsx`

Displays product information in a card format.

**Props:**
- `product: Product` - Product data
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { ProductCard } from "@/components/cards/ProductCard";

<ProductCard product={product} />
```

### CompanyCard

**Location:** `components/cards/CompanyCard.tsx`

Displays company information in a card format.

**Props:**
- `company: Company` - Company data
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { CompanyCard } from "@/components/cards/CompanyCard";

<CompanyCard company={company} />
```

### CategoryCard

**Location:** `components/cards/CategoryCard.tsx`

Displays category information in a card format.

**Props:**
- `category: Category` - Category data
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { CategoryCard } from "@/components/cards/CategoryCard";

<CategoryCard category={category} />
```

---

## Form Components

### ProductForm

**Location:** `components/forms/ProductForm.tsx`

Comprehensive product creation/editing form.

**Props:**
- `categories: Category[]` - Available categories
- `initialData?: ProductFormData` - Initial form data (for edit mode)
- `onSubmit: (data: ProductFormData) => void` - Submit handler
- `mode?: "create" | "edit"` - Form mode

**Usage:**
```tsx
import { ProductForm } from "@/components/forms/ProductForm";

<ProductForm
  categories={categories}
  onSubmit={handleSubmit}
  mode="create"
/>
```

### RFQForm

**Location:** `app/rfq/page.tsx` (integrated)

RFQ submission form with validation.

---

## UI Components (shadcn/ui)

All shadcn/ui components are available in `components/ui/`:

- `Button` - Button component with variants
- `Card` - Card container
- `Input` - Text input
- `Textarea` - Multi-line input
- `Select` - Dropdown select
- `Dialog` - Modal dialog
- `Badge` - Badge component
- `Tabs` - Tab navigation
- `Tooltip` - Tooltip component
- `Avatar` - Avatar component
- `Skeleton` - Loading skeleton

**Usage:**
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

---

## Accessibility Components

### SkipNavigation

**Location:** `components/accessibility/SkipNavigation.tsx`

Skip to main content link for keyboard users.

**Usage:** Automatically included in root layout.

### ARIALiveRegion

**Location:** `components/accessibility/ARIALiveRegion.tsx`

Announces dynamic content to screen readers.

**Props:**
- `message: string` - Message to announce
- `priority?: "polite" | "assertive"` - Announcement priority

**Usage:**
```tsx
import { ARIALiveRegion } from "@/components/accessibility/ARIALiveRegion";

<ARIALiveRegion message="Product added to cart" priority="polite" />
```

### KeyboardShortcuts

**Location:** `components/accessibility/KeyboardShortcuts.tsx`

Displays keyboard shortcuts dialog (Ctrl/Cmd + /).

**Usage:** Included in Footer.

---

## PWA Components

### ServiceWorkerRegistration

**Location:** `components/pwa/ServiceWorkerRegistration.tsx`

Registers service worker for PWA functionality.

**Usage:** Automatically included in root layout.

### PWAInstallPrompt

**Location:** `components/pwa/PWAInstallPrompt.tsx`

Shows PWA install prompt when available.

**Usage:** Automatically included in root layout.

---

## Best Practices

1. **Use TypeScript** - All components are typed
2. **Follow naming conventions** - PascalCase for components
3. **Use shadcn/ui** - For base UI components
4. **Accessibility first** - Include ARIA labels and keyboard support
5. **Responsive design** - Mobile-first approach
6. **Error handling** - Handle errors gracefully
7. **Loading states** - Show loading indicators for async operations

---

**Last Updated:** 2025-01-XX

