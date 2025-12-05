"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, User, LogOut, Settings, LayoutDashboard, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";
import { canUploadProducts, getMembershipStatusMessage } from "@/lib/membership";
import { toast } from "sonner";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.home);
  };

  const handleUploadProductClick = () => {
    if (!mounted) return;
    
    if (!isAuthenticated) {
      // Not logged in - redirect to registration
      toast.info("Please create an account to upload products");
      router.push(ROUTES.register);
      return;
    }

    if (!user) return;

    // Buyers cannot upload products - redirect to register as supplier
    if (user.role === "buyer") {
      toast.info("You need a supplier account to upload products. Please register as a supplier.");
      router.push(ROUTES.register);
      return;
    }

    // Check if user can upload products (must be supplier with approved membership)
    if (!canUploadProducts(user)) {
      const message = getMembershipStatusMessage(user);
      toast.error(message || "Please complete your membership application");
      router.push(ROUTES.membershipApply);
      return;
    }

    // User has approved membership - allow access
    router.push(ROUTES.dashboardProductNew);
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.home}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="Pak-Exporters Home"
          >
            <div className="relative h-10 w-32 md:h-12 md:w-40">
              <Image
                src="/logos/logo-white-bg.png"
                alt="Pak-Exporters Logo"
                fill
                className="object-contain dark:hidden"
                priority
                sizes="(max-width: 768px) 128px, 160px"
              />
              <Image
                src="/logos/logo-black-bg.png"
                alt="Pak-Exporters Logo"
                fill
                className="object-contain hidden dark:block"
                priority
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
            <Link
              href={ROUTES.products}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Products
            </Link>
            <Link
              href={ROUTES.categories}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href={ROUTES.companies}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Suppliers
            </Link>
            <Link
              href={ROUTES.rfq}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              RFQ
            </Link>
            <Link
              href={ROUTES.about}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
            <Button
              variant="default"
              size="sm"
              onClick={handleUploadProductClick}
              className="ml-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Product
            </Button>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search products, suppliers..."
                  className="pl-9 pr-10 w-full"
                  aria-label="Search products and suppliers"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      disabled
                      onClick={() => {
                        // Placeholder - would trigger AI search
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="sr-only">AI Search Assistant</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Search Assistant (Coming Soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Search</span>
            </Button>
            {mounted && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    aria-label={`User menu for ${user.name}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.admin} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.dashboard} className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.login}>Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={ROUTES.register}>Join Free</Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
              <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="border-t md:hidden animate-in slide-in-from-top-2 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            onClick={(e) => {
              // Close menu when clicking outside
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
            onTouchStart={(e) => {
              // Swipe down to close
              const touch = e.touches[0];
              const startY = touch.clientY;
              const handleTouchMove = (moveEvent: TouchEvent) => {
                const currentY = moveEvent.touches[0].clientY;
                if (currentY - startY > 100) {
                  // Swiped down more than 100px
                  setMobileMenuOpen(false);
                  document.removeEventListener("touchmove", handleTouchMove);
                }
              };
              document.addEventListener("touchmove", handleTouchMove);
              document.addEventListener(
                "touchend",
                () => {
                  document.removeEventListener("touchmove", handleTouchMove);
                },
                { once: true }
              );
            }}
          >
            <nav
              className="flex flex-col space-y-1 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <Link
                href={ROUTES.products}
                className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href={ROUTES.categories}
                className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href={ROUTES.companies}
                className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suppliers
              </Link>
              <Link
                href={ROUTES.rfq}
                className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                RFQ
              </Link>
              <Link
                href={ROUTES.about}
                className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="px-4 mt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    handleUploadProductClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Product
                </Button>
              </div>
              <div className="pt-4 border-t px-4">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products, suppliers..."
                      className="pl-9 pr-10 w-full"
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          disabled
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="sr-only">AI Search Assistant</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI Search Assistant (Coming Soon)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {mounted && isAuthenticated && user ? (
                <div className="pt-4 border-t space-y-1">
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-md mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {user.role === "admin" ? (
                    <Link
                      href={ROUTES.admin}
                      className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      href={ROUTES.dashboard}
                      className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href={ROUTES.dashboardSettings}
                    className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md text-destructive"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-2 px-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={ROUTES.login} onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href={ROUTES.register} onClick={() => setMobileMenuOpen(false)}>
                      Join Free
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

