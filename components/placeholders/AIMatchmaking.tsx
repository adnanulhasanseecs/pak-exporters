"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIMatchmakingProps {
  onMatch?: () => void;
  potentialMatches?: number;
  rfqId?: string;
}

/**
 * AI Buyer-Supplier Matchmaking Placeholder Component
 * 
 * Placeholder component for AI-powered matchmaking between buyers and suppliers.
 * Will analyze RFQ requirements and supplier capabilities to find best matches.
 * 
 * @param onMatch - Callback when matchmaking is triggered (placeholder)
 * @param potentialMatches - Number of potential matches (placeholder)
 * @param rfqId - RFQ ID for context (optional)
 */
export function AIMatchmaking({
  onMatch,
  potentialMatches = 0,
  rfqId: _rfqId,
}: AIMatchmakingProps) {
  const handleClick = () => {
    // Placeholder - would trigger AI matchmaking
    if (onMatch) {
      onMatch();
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>AI Buyer-Supplier Matchmaking</CardTitle>
        </div>
        <CardDescription>
          Find the best suppliers for your RFQ using AI-powered matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {potentialMatches > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Potential Matches</span>
              <Badge variant="secondary" className="text-lg">
                {potentialMatches}
              </Badge>
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  onClick={handleClick}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Matches (Coming Soon)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI will analyze requirements and match you with the best suppliers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

