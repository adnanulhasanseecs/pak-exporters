/**
 * Blog / article type definitions
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  category?: string;
  image?: string;
}

export type BlogCategory =
  | "all"
  | "getting-started"
  | "success-stories"
  | "features"
  | "membership"
  | "tips"
  | "faq"
  | "challenges"
  | "introduction";

// Note: Category labels are now translatable via i18n
// This is kept for type safety and fallback
export const BLOG_CATEGORIES: Record<BlogCategory, { labelKey: string; descriptionKey: string }> = {
  all: { labelKey: "categories.all", descriptionKey: "categories.all" },
  "getting-started": {
    labelKey: "categories.gettingStarted",
    descriptionKey: "categories.gettingStartedDescription",
  },
  "success-stories": {
    labelKey: "categories.successStories",
    descriptionKey: "categories.successStoriesDescription",
  },
  features: {
    labelKey: "categories.features",
    descriptionKey: "categories.featuresDescription",
  },
  membership: {
    labelKey: "categories.membership",
    descriptionKey: "categories.membershipDescription",
  },
  tips: {
    labelKey: "categories.tips",
    descriptionKey: "categories.tipsDescription",
  },
  faq: {
    labelKey: "categories.faq",
    descriptionKey: "categories.faqDescription",
  },
  challenges: {
    labelKey: "categories.challenges",
    descriptionKey: "categories.challengesDescription",
  },
  introduction: {
    labelKey: "categories.introduction",
    descriptionKey: "categories.introductionDescription",
  },
};


