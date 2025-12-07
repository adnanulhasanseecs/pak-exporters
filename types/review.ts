/**
 * Review and Rating type definitions
 */

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userCompany?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verified: boolean; // Whether the reviewer is verified
  helpful: number; // Number of helpful votes
  createdAt: string;
  updatedAt?: string;
  // Context
  productId?: string;
  companyId?: string;
  orderId?: string; // If review is for a completed order
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

