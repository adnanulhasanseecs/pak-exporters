"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" aria-hidden="true" />,
        info: <Info className="h-4 w-4" aria-hidden="true" />,
        warning: <TriangleAlert className="h-4 w-4" aria-hidden="true" />,
        error: <OctagonX className="h-4 w-4" aria-hidden="true" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        // Accessibility: Ensure toasts are announced to screen readers
        role: "status",
        "aria-live": "polite",
      }}
      // Position to avoid blocking important content
      position="top-right"
      // Accessibility: Rich colors for better visibility
      richColors
      {...props}
    />
  )
}

export { Toaster }
