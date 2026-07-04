"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  message: string
  delayedMessage?: string
  delayedHint?: string
  delayMs?: number
}

export function LoadingScreen({
  message,
  delayedMessage,
  delayedHint,
  delayMs = 4000,
}: LoadingScreenProps) {
  const [showDelayed, setShowDelayed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowDelayed(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  const isDelayed = showDelayed && delayedMessage

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-2 bg-background px-6 text-center">
      <p className="text-sm text-foreground">{isDelayed ? delayedMessage : message}</p>
      {isDelayed && delayedHint && (
        <p className="max-w-xs text-xs text-muted-foreground">{delayedHint}</p>
      )}
    </div>
  )
}
