"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const heroSlides = [
  {
    id: 1,
    title: "Pakistan's First Export Marketplace",
    description: "Connecting exporters with global buyers since 2019 - Export Quality Products",
    image: "https://pak-exporters.com/wp-content/uploads/01.jpg",
    cta: "Browse Products",
    link: ROUTES.products,
  },
  {
    id: 2,
    title: "HUGE SALE - 70% OFF",
    description: "Export Quality Products - Super Fast Fulfillment with Live Tracking",
    image: "https://pak-exporters.com/wp-content/uploads/02.jpg",
    cta: "Shop Now",
    link: ROUTES.products,
  },
  {
    id: 3,
    title: "Premium Suppliers Network",
    description: "45+ Unique Products - Verified Suppliers - Secure System",
    image: "https://pak-exporters.com/wp-content/uploads/03.jpg",
    cta: "Find Suppliers",
    link: ROUTES.companies,
  },
  {
    id: 4,
    title: "Global Trade Made Easy",
    description: "Connect with verified suppliers and discover quality products from Pakistan",
    image: "https://pak-exporters.com/wp-content/uploads/04.jpg",
    cta: "Explore Categories",
    link: ROUTES.categories,
  },
  {
    id: 5,
    title: "Trusted Export Platform",
    description: "Secure transactions, verified suppliers, and quality assurance",
    image: "https://pak-exporters.com/wp-content/uploads/05.jpg",
    cta: "Learn More",
    link: ROUTES.about,
  },
  {
    id: 6,
    title: "Export Quality Products",
    description: "Browse our extensive catalog of premium export products",
    image: "https://pak-exporters.com/wp-content/uploads/06.jpg",
    cta: "View Products",
    link: ROUTES.products,
  },
  {
    id: 7,
    title: "Join Our Network",
    description: "Become a verified supplier and grow your export business",
    image: "https://pak-exporters.com/wp-content/uploads/07.jpg",
    cta: "Become a Member",
    link: ROUTES.membershipApply,
  },
  {
    id: 8,
    title: "Fast & Reliable",
    description: "Super Fast Fulfillment with Live Tracking - Your trusted export partner",
    image: "https://pak-exporters.com/wp-content/uploads/08.jpg",
    cta: "Get Started",
    link: ROUTES.register,
  },
  {
    id: 9,
    title: "Quality Assured",
    description: "Export quality products from verified Pakistani suppliers",
    image: "https://pak-exporters.com/wp-content/uploads/09.jpg",
    cta: "Browse Now",
    link: ROUTES.products,
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 text-center text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                  {slide.description}
                </p>
                <Button size="lg" asChild>
                  <Link href={slide.link}>{slide.cta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

