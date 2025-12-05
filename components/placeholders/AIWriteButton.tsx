"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

export function AIWriteButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled
            onClick={() => {
              // Placeholder - would trigger AI description generation
            }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="sr-only">Write with AI</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Write with AI (Coming Soon)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

