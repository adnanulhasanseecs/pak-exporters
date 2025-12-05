"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIProductGeneratorProps {
  onGenerate?: (description: string) => void;
}

export function AIProductGenerator({ onGenerate }: AIProductGeneratorProps) {
  const handleClick = () => {
    // Placeholder - would trigger AI generation
    if (onGenerate) {
      onGenerate("AI-generated product description would appear here...");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Product Description Generator</CardTitle>
        </div>
        <CardDescription>
          Use AI to instantly create high-quality product descriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                Generate Description (Coming Soon)
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI-powered feature coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

