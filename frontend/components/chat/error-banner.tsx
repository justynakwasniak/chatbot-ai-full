"use client"

import { X } from "lucide-react"

interface ErrorBannerProps {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="absolute left-0 right-0 top-0 z-20 flex items-center justify-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-destructive/20"
        aria-label="Dismiss error"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
