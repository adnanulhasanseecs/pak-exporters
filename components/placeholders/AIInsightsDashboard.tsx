"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIInsightsDashboardProps {
  onViewInsights?: () => void;
  insightsCount?: number;
}

/**
 * AI Insights Dashboard Placeholder Component
 * 
 * Placeholder component for AI-powered business insights and analytics.
 * Will provide sales trends, market analysis, and actionable recommendations.
 * 
 * @param onViewInsights - Callback when viewing insights (placeholder)
 * @param insightsCount - Number of available insights (placeholder)
 */
export function AIInsightsDashboard({
  onViewInsights,
  insightsCount = 0,
}: AIInsightsDashboardProps) {
  const handleClick = () => {
    // Placeholder - would navigate to full insights page
    if (onViewInsights) {
      onViewInsights();
    }
  };

  const insights = [
    { icon: TrendingUp, label: "Sales Trends", description: "Analyze sales patterns" },
    { icon: BarChart3, label: "Market Analysis", description: "Market insights" },
    { icon: Lightbulb, label: "Recommendations", description: "AI suggestions" },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights Dashboard</CardTitle>
          </div>
          {insightsCount > 0 && (
            <Badge variant="secondary">{insightsCount} Insights</Badge>
          )}
        </div>
        <CardDescription>
          Get AI-powered insights about your business performance and market trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-muted/50 text-center"
                >
                  <Icon className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs font-medium">{insight.label}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              );
            })}
          </div>
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
                  View Full Insights (Coming Soon)
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-powered insights and recommendations coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

