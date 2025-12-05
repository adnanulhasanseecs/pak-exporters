/**
 * Keyboard Shortcuts Component
 * Displays available keyboard shortcuts for accessibility
 * WCAG 2.1 AA compliant
 */

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

const KEYBOARD_SHORTCUTS = [
  {
    key: "Tab",
    description: "Navigate to next interactive element",
  },
  {
    key: "Shift + Tab",
    description: "Navigate to previous interactive element",
  },
  {
    key: "Enter / Space",
    description: "Activate button or link",
  },
  {
    key: "Escape",
    description: "Close modal or dialog",
  },
  {
    key: "Arrow Keys",
    description: "Navigate within lists, menus, or carousels",
  },
  {
    key: "Home",
    description: "Jump to beginning of list or page",
  },
  {
    key: "End",
    description: "Jump to end of list or page",
  },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to open keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          aria-label="View keyboard shortcuts (Ctrl + /)"
        >
          <Keyboard className="h-4 w-4 mr-1" aria-hidden="true" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent aria-labelledby="keyboard-shortcuts-title">
        <DialogHeader>
          <DialogTitle id="keyboard-shortcuts-title">Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the application more efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 py-2 border-b last:border-0"
            >
              <p className="text-sm text-muted-foreground flex-1">{shortcut.description}</p>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Press <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded">/</kbd> to open this dialog anytime.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

