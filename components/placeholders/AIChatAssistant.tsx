"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Send, Bot } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIChatAssistantProps {
  onSendMessage?: (message: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

/**
 * AI Chat Assistant Placeholder Component
 * 
 * Placeholder component for AI-powered chat assistant.
 * Will provide conversational interface for user queries and support.
 * 
 * @param onSendMessage - Callback when message is sent (placeholder)
 * @param isMinimized - Whether chat is minimized (optional)
 * @param onToggleMinimize - Callback to toggle minimize state (optional)
 */
export function AIChatAssistant({
  onSendMessage,
  isMinimized = false,
  onToggleMinimize,
}: AIChatAssistantProps) {
  const [message, setMessage] = useState("");
  const placeholderMessages = [
    { role: "assistant" as const, text: "Hello! I'm your AI assistant. How can I help you today?" },
    { role: "user" as const, text: "Find exporters in Sialkot" },
    { role: "assistant" as const, text: "I can help you find exporters. This feature is coming soon!" },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Placeholder - would send message to AI
    if (onSendMessage) {
      onSendMessage(message);
    }
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={onToggleMinimize}
        aria-label="Open AI Chat Assistant"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="border-dashed w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>AI Chat Assistant</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </Badge>
        </div>
        <CardDescription>
          Ask me anything about products, suppliers, or the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-3 h-64 overflow-y-auto p-3 border rounded-lg bg-muted/30">
          {placeholderMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled
                  className="flex-1"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>AI chat assistant coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  disabled
                  onClick={handleSend}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send message (Coming Soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

