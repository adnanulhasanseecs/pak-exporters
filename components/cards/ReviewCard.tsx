"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Verified, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Review } from "@/types/review";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showActions?: boolean;
  className?: string;
}

/**
 * ReviewCard Component
 * 
 * Displays a single review/rating with user information, rating stars, comment, and actions.
 * 
 * @param review - Review data to display
 * @param onHelpful - Callback when user marks review as helpful
 * @param onReport - Callback when user reports review
 * @param showActions - Whether to show action buttons (default: true)
 * @param className - Additional CSS classes
 */
export function ReviewCard({
  review,
  onHelpful,
  onReport,
  showActions = true,
  className,
}: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={cn(
          "h-4 w-4",
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground"
        )}
      />
    ));
  };

  const handleHelpful = () => {
    if (onHelpful) {
      onHelpful(review.id);
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(review.id);
    }
  };

  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">
                  {review.userName}
                </h4>
                {review.verified && (
                  <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                    <Verified className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {review.userCompany && (
                <p className="text-xs text-muted-foreground truncate">
                  {review.userCompany}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {renderStars(review.rating)}
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport}>
                  Report review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {review.title && (
          <h5 className="font-medium text-sm">{review.title}</h5>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
        {showActions && (
          <div className="flex items-center gap-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleHelpful}
            >
              <ThumbsUp className="h-3 w-3 mr-1.5" />
              Helpful ({review.helpful || 0})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

