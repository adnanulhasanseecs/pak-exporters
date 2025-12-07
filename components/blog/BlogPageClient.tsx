"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { BLOG_CATEGORIES } from "@/types/blog";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import Image from "next/image";

interface BlogPageClientProps {
  initialPosts: BlogPost[];
}

export function BlogPageClient({ initialPosts }: BlogPageClientProps) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>("all");

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") {
      return initialPosts;
    }
    return initialPosts.filter((post) => post.category === selectedCategory);
  }, [initialPosts, selectedCategory]);

  // Get unique categories from posts
  const availableCategories = useMemo(() => {
    const categories = new Set<BlogCategory>(["all"]);
    initialPosts.forEach((post) => {
      if (post.category) {
        // Only add if category is a valid BlogCategory
        const validCategory = post.category as BlogCategory;
        if (BLOG_CATEGORIES[validCategory]) {
          categories.add(validCategory);
        }
      }
    });
    return Array.from(categories);
  }, [initialPosts]);

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string): number => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  // Format date using locale
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get featured post (first post or most recent)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 0 ? filteredPosts.slice(1) : [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&h=1080&fit=crop&q=80"
            alt="Writing and knowledge"
            fill
            className="object-cover"
            priority
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-primary/90" />
        </div>
        {/* Background gradient with glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/50 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeInOnScroll>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                {t("subtitle")}
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <FadeInOnScroll>
            <div className="flex flex-wrap gap-2 justify-center">
              {availableCategories.map((category) => {
                const categoryInfo = BLOG_CATEGORIES[category];
                const isActive = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t(categoryInfo.labelKey)}
                  </Button>
                );
              })}
            </div>
            {selectedCategory !== "all" && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {t(BLOG_CATEGORIES[selectedCategory].descriptionKey)} · {filteredPosts.length} {filteredPosts.length !== 1 ? t("posts") : t("post")}
              </p>
            )}
          </FadeInOnScroll>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "all" && (
          <FadeInOnScroll>
            <div className="mb-12">
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] border-2 border-primary/20">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featuredPost.image && (
                      <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                        <Image
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-background">
                      <div className="flex items-center gap-2 mb-4">
                        {featuredPost.category && (
                          <Badge className="bg-primary text-primary-foreground">
                            {t(BLOG_CATEGORIES[featuredPost.category as BlogCategory]?.labelKey || "categories.all")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          Featured
                        </Badge>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(featuredPost.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{t("minRead", { minutes: calculateReadingTime(featuredPost.content) })}</span>
                        </div>
                      </div>
                      <Button className="w-fit group">
                        {t("readArticle")}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </FadeInOnScroll>
        )}

        {/* Regular Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCategory === "all" ? regularPosts : filteredPosts).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="flex flex-col h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-border/50 overflow-hidden group">
                  {/* Image with gradient overlay */}
                  {post.image && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 group-hover:from-black/80 transition-all" />
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {post.category && (
                        <div className="absolute top-3 left-3 z-20">
                          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                            {t(BLOG_CATEGORIES[post.category as BlogCategory]?.labelKey || "categories.all")}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="text-xs">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs">{t("minRead", { minutes: calculateReadingTime(post.content) })}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" className="w-full group/btn">
                        {t("readArticle")}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <FadeInOnScroll>
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                {t("noPosts")}
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory("all")}
                className="mt-4"
              >
                {t("viewAllPosts")}
              </Button>
            </div>
          </FadeInOnScroll>
        )}
      </div>
    </div>
  );
}

