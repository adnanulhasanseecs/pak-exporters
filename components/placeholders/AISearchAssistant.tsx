"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AISearchAssistant() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle>AI Search Assistant</CardTitle>
        </div>
        <CardDescription>
          Ask AI anything: &quot;Find leather glove exporters in Sialkot&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="w-full" disabled>
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI Assistant (Coming Soon)
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI-powered search assistant coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

